
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'https://esm.sh/ethers@6.13.1';
import { streakContractAddress, streakContractAbi } from '../services/streakContract';

interface Eip1193Provider {
    request(request: { method: string; params?: any[] | Record<string, any> }): Promise<any>;
    on(event: string, listener: (...args: any[]) => void): void;
    removeListener(event: string, listener: (...args: any[]) => void): void;
}

declare global {
    interface Window {
        ethereum?: Eip1193Provider;
    }
}

// Base Chain details
const BASE_CHAIN_ID = '0x2105'; // 8453 in hex
const BASE_RPC_URL = 'https://mainnet.base.org';
const BASE_CHAIN_PARAMS = {
    chainId: BASE_CHAIN_ID,
    chainName: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: [BASE_RPC_URL],
    blockExplorerUrls: ['https://basescan.org'],
};

export function useWeb3Streak() {
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [canInteract, setCanInteract] = useState(false);
    
    const [isConnecting, setIsConnecting] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isConnected = !!address;

    const clearState = useCallback(() => {
        setSigner(null);
        setAddress(null);
        setCanInteract(false);
        setError(null);
    }, []);

    const switchNetwork = useCallback(async (ethProvider: Eip1193Provider) => {
        try {
            await ethProvider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: BASE_CHAIN_ID }],
            });
        } catch (switchError: any) {
            if (switchError.code === 4902) { // Chain not added
                try {
                    await ethProvider.request({
                        method: 'wallet_addEthereumChain',
                        params: [BASE_CHAIN_PARAMS],
                    });
                } catch (addError) {
                    throw new Error("Failed to add Base network.");
                }
            } else {
                throw new Error("Failed to switch to Base network.");
            }
        }
    }, []);

    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            setError("Please install a Web3 wallet like MetaMask.");
            return;
        }
        
        setIsConnecting(true);
        setError(null);
        
        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            await switchNetwork(window.ethereum);

            const newSigner = await browserProvider.getSigner();
            const userAddress = await newSigner.getAddress();
            
            setSigner(newSigner);
            setAddress(userAddress);
            
        } catch (e: any) {
            console.error("Connection failed:", e);
            setError(e.message || "Failed to connect wallet.");
            clearState();
        } finally {
            setIsConnecting(false);
        }
    }, [switchNetwork, clearState]);

    useEffect(() => {
        if (!signer || !address) {
            setCanInteract(false);
            return;
        }

        const contract = new ethers.Contract(streakContractAddress, streakContractAbi, signer);

        const checkEligibility = async () => {
            try {
                const isEligible = await contract.canClaim(address);
                setCanInteract(isEligible);
            } catch (e) {
                // This can happen for new users if the contract reverts on canClaim.
                // It's safe to assume they cannot interact yet.
                console.warn("Could not check claim eligibility. Defaulting to false.", e);
                setCanInteract(false);
            }
        };

        checkEligibility(); // Check immediately on connect
        const intervalId = setInterval(checkEligibility, 15000); // Poll every 15 seconds

        return () => clearInterval(intervalId); // Cleanup interval on disconnect
    }, [signer, address]);

    const interactWithContract = useCallback(async () => {
        if (!signer || !canInteract) {
            setError("Not eligible to interact yet.");
            return;
        }

        setIsInteracting(true);
        setError(null);
        const contract = new ethers.Contract(streakContractAddress, streakContractAbi, signer);

        try {
            const tx = await contract.claim(); // Let wallet estimate gas
            const receipt = await tx.wait();

            if (receipt.status === 1) {
                // Success! Force a re-check of eligibility, which should now be false.
                setCanInteract(false);
            } else {
                 setError("Transaction failed on-chain.");
            }
        } catch (e: any) {
            console.error("Interaction failed:", e);
            if (e.code === 'ACTION_REJECTED') {
                 setError("Transaction rejected.");
            } else {
                setError("Interaction failed.");
            }
        } finally {
            setIsInteracting(false);
        }
    }, [signer, canInteract]);
    
    useEffect(() => {
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                clearState();
            } else {
                connectWallet();
            }
        };
        
        const handleChainChanged = () => {
            window.location.reload();
        };

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
        }
        
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, [clearState, connectWallet]);

    return {
        isConnected,
        isConnecting,
        isInteracting,
        canInteract,
        error,
        connectWallet,
        interactWithContract
    };
}

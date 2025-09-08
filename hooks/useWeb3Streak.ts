
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
const BASE_CHAIN_PARAMS = {
    chainId: BASE_CHAIN_ID,
    chainName: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
};

export function useWeb3Streak() {
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    
    const [isConnecting, setIsConnecting] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isConnected = !!address;

    const clearState = useCallback(() => {
        setSigner(null);
        setAddress(null);
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

    const interactWithContract = useCallback(async () => {
        if (!signer) {
            setError("Wallet not connected.");
            return;
        }
    
        setIsInteracting(true);
        setError(null);
    
        try {
            const contract = new ethers.Contract(streakContractAddress, streakContractAbi, signer);
    
            // We run a static call first to simulate the transaction. This checks
            // for contract-side errors (like a cooldown) without costing gas.
            try {
                await contract.claim.staticCall();
            } catch (simulationError: any) {
                console.error("Interaction simulation failed:", simulationError);
                // Try to get a human-readable reason from the contract revert.
                const reason = simulationError.reason || "Interaction might fail or is not allowed yet.";
                setError(reason);
                setIsInteracting(false);
                return;
            }
    
            // If simulation is successful, send the actual transaction.
            const tx = await contract.claim();
            await tx.wait(); // Wait for it to be mined
    
        } catch (e: any) {
            console.error("Interaction failed:", e);
            const errorMessage = e.reason || e.data?.message || e.message || "Transaction failed.";
            setError(errorMessage);
        } finally {
            setIsInteracting(false);
        }
    }, [signer]);
    
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
        error,
        connectWallet,
        interactWithContract
    };
}

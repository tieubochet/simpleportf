
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
    const [streak, setStreak] = useState(0);
    
    const [isConnecting, setIsConnecting] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isConnected = !!address;

    const clearState = useCallback(() => {
        setSigner(null);
        setAddress(null);
        setStreak(0);
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
    
    const fetchStreak = useCallback(async (userAddress: string) => {
        try {
            const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
            const contract = new ethers.Contract(streakContractAddress, streakContractAbi, provider);
            const currentStreak = await contract.getStreak(userAddress);
            setStreak(Number(currentStreak));
        } catch (e) {
            console.error("Failed to fetch streak:", e);
            setStreak(0); // Reset on error
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
            
            // 1. Explicitly request accounts to ensure wallet connection prompt
            await browserProvider.send("eth_requestAccounts", []);

            // 2. Switch to the correct network
            await switchNetwork(window.ethereum);
            
            // 3. Get the signer, which should now be available without a prompt
            const newSigner = await browserProvider.getSigner();
            const userAddress = await newSigner.getAddress();
            
            setSigner(newSigner);
            setAddress(userAddress);
            await fetchStreak(userAddress);
            
        } catch (e: any) {
            console.error("Connection failed:", e);
            setError(e.message || "Failed to connect wallet.");
            clearState();
        } finally {
            setIsConnecting(false);
        }
    }, [switchNetwork, clearState, fetchStreak]);

    const checkInWithContract = useCallback(async () => {
        if (!signer || !address) {
            setError("Wallet not connected.");
            return;
        }

        setIsInteracting(true);
        setError(null);
        const contract = new ethers.Contract(streakContractAddress, streakContractAbi, signer);

        try {
            const tx = await contract.checkIn();
            const receipt = await tx.wait();

            if (receipt.status === 1) {
                // Success, refresh the streak from the contract
                await fetchStreak(address);
            } else {
                 setError("Transaction failed.");
            }
        } catch (e: any) {
            console.error("Check-in failed:", e);
            if (e.code === 'ACTION_REJECTED') {
                 setError("Transaction rejected.");
            } else {
                setError("Check-in failed.");
            }
        } finally {
            setIsInteracting(false);
        }
    }, [signer, address, fetchStreak]);
    
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
        streak,
        error,
        connectWallet,
        checkInWithContract
    };
}
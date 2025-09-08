import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { streakContractAddress, streakContractAbi } from '../services/streakContract';

// FIX: Define the type for window.ethereum to resolve TypeScript errors.
// The ethereum object is injected by web3 wallets like MetaMask.
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
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [streakCount, setStreakCount] = useState(0);
    const [canClaim, setCanClaim] = useState(false);
    
    const [isConnecting, setIsConnecting] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isConnected = !!address;

    const clearState = useCallback(() => {
        setSigner(null);
        setAddress(null);
        setStreakCount(0);
        setCanClaim(false);
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

    const loadContractData = useCallback(async (currentSigner: ethers.JsonRpcSigner) => {
        try {
            setError(null);
            const userAddress = await currentSigner.getAddress();
            const contract = new ethers.Contract(streakContractAddress, streakContractAbi, currentSigner);
            
            const [streak, canUserClaim] = await Promise.all([
                contract.getStreak(userAddress),
                contract.canClaim(userAddress)
            ]);
            
            setStreakCount(Number(streak));
            setCanClaim(canUserClaim);
            setAddress(userAddress);

        } catch (e) {
            console.error("Error loading contract data:", e);
            setError("Could not load streak data. Are you on the Base network?");
            clearState();
        }
    }, [clearState]);
    
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
            setProvider(browserProvider);
            setSigner(newSigner);
            await loadContractData(newSigner);
            
        } catch (e: any) {
            console.error("Connection failed:", e);
            setError(e.message || "Failed to connect wallet.");
            clearState();
        } finally {
            setIsConnecting(false);
        }
    }, [switchNetwork, loadContractData, clearState]);

    const claimStreak = useCallback(async () => {
        if (!signer) {
            setError("Wallet not connected.");
            return;
        }
        
        setIsClaiming(true);
        setError(null);

        try {
            const contract = new ethers.Contract(streakContractAddress, streakContractAbi, signer);
            const tx = await contract.claim();
            await tx.wait(); // Wait for the transaction to be mined
            
            // Refresh data after successful claim
            await loadContractData(signer);

        } catch (e: any) {
            console.error("Claim failed:", e);
            const errorMessage = e.reason || e.data?.message || e.message || "Transaction failed.";
            setError(errorMessage);
        } finally {
            setIsClaiming(false);
        }
    }, [signer, loadContractData]);
    
    useEffect(() => {
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                clearState();
            } else if (provider) {
                // Re-connect with the new account
                connectWallet();
            }
        };
        
        const handleChainChanged = () => {
            // Reload the page to reset state and re-check network
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
    }, [provider, clearState, connectWallet]);

    return {
        isConnected,
        isConnecting,
        isClaiming,
        streakCount,
        canClaim,
        error,
        connectWallet,
        claimStreak
    };
}
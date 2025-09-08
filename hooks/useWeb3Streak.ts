
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'https://esm.sh/ethers@6.13.1';
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
        setProvider(null);
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
        setError(null);
        try {
            // Use a dedicated provider for read-only calls to ensure we're always on Base.
            const baseProvider = new ethers.JsonRpcProvider(BASE_CHAIN_PARAMS.rpcUrls[0]);
            const contractReader = new ethers.Contract(streakContractAddress, streakContractAbi, baseProvider);
            const userAddress = await currentSigner.getAddress();
            
            // Use Promise.allSettled to fetch data and handle expected reverts gracefully.
            const results = await Promise.allSettled([
                contractReader.getStreak(userAddress),
                contractReader.canClaim(userAddress) // Use the contract's function as the source of truth
            ]);

            // Process streak result
            const streakResult = results[0];
            if (streakResult.status === 'fulfilled') {
                setStreakCount(Number(streakResult.value));
            } else {
                console.warn("getStreak() reverted. Defaulting to 0. This is expected for new users.");
                setStreakCount(0);
            }
            
            // Process canClaim result
            const canClaimResult = results[1];
            if (canClaimResult.status === 'fulfilled') {
                setCanClaim(canClaimResult.value);
            } else {
                console.warn("canClaim() reverted. Defaulting to false. This is expected for new users.");
                setCanClaim(false);
            }

            setAddress(userAddress);

        } catch (e) {
            console.error("Critical error loading contract data:", e);
            setError("Contract error. Check network.");
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
        if (!signer || !canClaim) { // Added !canClaim check
            setError("Not eligible to claim.");
            return;
        }
    
        setIsClaiming(true);
        setError(null);
    
        try {
            const contract = new ethers.Contract(streakContractAddress, streakContractAbi, signer);
    
            // The simulation with staticCall is now a redundant safety check,
            // as the UI should already be in sync. We keep it for robustness.
            try {
                await contract.claim.staticCall();
            } catch (simulationError: any) {
                console.error("Claim simulation failed despite UI check:", simulationError);
                setError("Cannot claim yet. Please try again later.");
                setIsClaiming(false);
                return;
            }
    
            // If the simulation succeeds, send the actual transaction.
            const tx = await contract.claim();
            await tx.wait();
    
            // Reload data to show the updated streak.
            await loadContractData(signer);
    
        } catch (e: any) {
            console.error("Claim transaction failed:", e);
            const errorMessage = e.reason || e.data?.message || e.message || "Transaction failed.";
            setError(errorMessage);
        } finally {
            setIsClaiming(false);
        }
    }, [signer, canClaim, loadContractData]);
    
    useEffect(() => {
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                clearState();
            } else if (provider) {
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

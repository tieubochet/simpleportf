
import { useAccount, useSwitchChain, useWriteContract, useReadContract } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useCallback, useEffect } from 'react';
import { streakContractAddress, streakContractAbi } from '../services/streakContract';

const BASE_CHAIN_ID_DECIMAL = 8453;

export function useWeb3Streak() {
    const { open } = useWeb3Modal();
    const { address, isConnected, chain } = useAccount();
    const { switchChain, isPending: isSwitching } = useSwitchChain();
    const { data: hash, writeContract, isPending: isWriting, error: writeError } = useWriteContract();

    const needsToSwitch = isConnected && chain?.id !== BASE_CHAIN_ID_DECIMAL;

    const handleAction = useCallback(async () => {
        if (!isConnected) {
            open();
        } else if (needsToSwitch) {
            switchChain({ chainId: BASE_CHAIN_ID_DECIMAL });
        } else {
            writeContract({
                address: streakContractAddress,
                abi: streakContractAbi,
                functionName: 'checkIn',
            });
        }
    }, [isConnected, needsToSwitch, open, switchChain, writeContract]);
    
    const { data: streakData, refetch, error: readError } = useReadContract({
        address: streakContractAddress,
        abi: streakContractAbi,
        functionName: 'getStreak',
        args: [address!],
        chainId: BASE_CHAIN_ID_DECIMAL,
        query: {
            enabled: !!address,
        }
    });

    useEffect(() => {
        if (hash) {
            const timer = setTimeout(() => refetch(), 3000); // Refetch after a delay
            return () => clearTimeout(timer);
        }
    }, [hash, refetch]);

    const streak = streakData ? Number(streakData) : 0;
    const combinedError = writeError || readError;

    return {
        isConnected: isConnected && !needsToSwitch,
        isConnecting: isSwitching,
        isInteracting: isWriting,
        streak,
        error: combinedError ? (combinedError.shortMessage || combinedError.message) : null,
        connectWallet: handleAction,
        checkInWithContract: handleAction,
    };
}


import { useAccount, useSwitchChain, useWriteContract, useReadContract } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useCallback, useEffect } from 'react';
import { streakContractAddress, streakContractAbi } from '../services/celoStreakContract';

const CELO_CHAIN_ID_DECIMAL = 42220;

export function useCeloStreak() {
    const { open } = useWeb3Modal();
    const { address, isConnected, chain } = useAccount();
    const { switchChain, isPending: isSwitching } = useSwitchChain();
    const { data: hash, writeContract, isPending: isWriting, error: writeError } = useWriteContract();

    const needsToSwitch = isConnected && chain?.id !== CELO_CHAIN_ID_DECIMAL;

    const handleAction = useCallback(async () => {
        if (!isConnected) {
            open();
        } else if (needsToSwitch) {
            switchChain({ chainId: CELO_CHAIN_ID_DECIMAL });
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
        chainId: CELO_CHAIN_ID_DECIMAL,
        query: {
            enabled: !!address,
        }
    });

    useEffect(() => {
        if (hash) {
            const timer = setTimeout(() => refetch(), 3000);
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

import { useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/src/config/contracts';
import ExitDistributionABI from '@/src/abi/ExitDistribution.json';

export function useExitDistribution() {
  const { writeContractAsync } = useWriteContract();

  // Read: Calculate redemption
  const useCalculateRedemption = (astAmount?: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.exitDistribution,
      abi: ExitDistributionABI,
      functionName: 'calculateRedemption',
      args: astAmount ? [astAmount] : undefined,
      query: {
        enabled: !!astAmount && astAmount > 0n,
      },
    });
  };

  // Read: Final price per token
  const useFinalPricePerToken = () => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.exitDistribution,
      abi: ExitDistributionABI,
      functionName: 'finalPricePerToken',
    });
  };

  // Read: Total proceeds
  const useTotalProceeds = () => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.exitDistribution,
      abi: ExitDistributionABI,
      functionName: 'totalProceeds',
    });
  };

  // Read: Total redeemed
  const useTotalRedeemed = () => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.exitDistribution,
      abi: ExitDistributionABI,
      functionName: 'totalRedeemed',
    });
  };

  // Read: Proceeds deposited
  const useProceedsDeposited = () => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.exitDistribution,
      abi: ExitDistributionABI,
      functionName: 'proceedsDeposited',
    });
  };

  // Read: Remaining proceeds
  const useRemainingProceeds = () => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.exitDistribution,
      abi: ExitDistributionABI,
      functionName: 'remainingProceeds',
    });
  };

  // Read: Calculate return percentage
  const useCalculateReturn = (initialInvestment?: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.exitDistribution,
      abi: ExitDistributionABI,
      functionName: 'calculateReturn',
      args: initialInvestment ? [initialInvestment] : undefined,
      query: {
        enabled: !!initialInvestment && initialInvestment > 0n,
      },
    });
  };

  // Write: Redeem tokens
  const redeem = async (astAmount: bigint) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.exitDistribution,
      abi: ExitDistributionABI,
      functionName: 'redeem',
      args: [astAmount],
    });
    return hash;
  };

  // Write: Deposit proceeds (owner only)
  const depositProceeds = async (amount: bigint) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.exitDistribution,
      abi: ExitDistributionABI,
      functionName: 'depositProceeds',
      args: [amount],
    });
    return hash;
  };

  return {
    useCalculateRedemption,
    useFinalPricePerToken,
    useTotalProceeds,
    useTotalRedeemed,
    useProceedsDeposited,
    useRemainingProceeds,
    useCalculateReturn,
    redeem,
    depositProceeds,
  };
}

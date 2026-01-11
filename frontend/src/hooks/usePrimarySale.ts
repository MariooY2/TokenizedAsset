import { useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES, PRICE_PER_TOKEN } from '@/src/config/contracts';
import PrimarySaleABI from '@/src/abi/PrimarySale.json';
import USDCABI from '@/src/abi/USDC.json';

export function usePrimarySale() {
  const { writeContractAsync } = useWriteContract();

  // Read: Calculate cost
  const useCalculateCost = (astAmount?: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.primarySale,
      abi: PrimarySaleABI,
      functionName: 'calculateCost',
      args: astAmount ? [astAmount] : undefined,
      query: {
        enabled: !!astAmount && astAmount > 0n,
      },
    });
  };

  // Read: Remaining tokens
  const useRemainingTokens = () => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.primarySale,
      abi: PrimarySaleABI,
      functionName: 'remainingTokens',
    });
  };

  // Read: Total sold
  const useTotalSold = () => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.primarySale,
      abi: PrimarySaleABI,
      functionName: 'totalSold',
    });
  };

  // Read: Sale active
  const useSaleActive = () => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.primarySale,
      abi: PrimarySaleABI,
      functionName: 'saleActive',
    });
  };

  // Write: Approve USDC for purchase
  const approveUSDC = async (amount: bigint) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.usdc,
      abi: USDCABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.primarySale, amount],
    });
    return hash;
  };

  // Write: Buy tokens
  const buyTokens = async (amount: bigint) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.primarySale,
      abi: PrimarySaleABI,
      functionName: 'buyTokens',
      args: [amount],
    });
    return hash;
  };

  // Write: Close sale (owner only)
  const closeSale = async () => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.primarySale,
      abi: PrimarySaleABI,
      functionName: 'closeSale',
    });
    return hash;
  };

  // Write: Withdraw funds (owner only)
  const withdrawFunds = async () => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.primarySale,
      abi: PrimarySaleABI,
      functionName: 'withdrawFunds',
    });
    return hash;
  };

  return {
    useCalculateCost,
    useRemainingTokens,
    useTotalSold,
    useSaleActive,
    approveUSDC,
    buyTokens,
    closeSale,
    withdrawFunds,
    PRICE_PER_TOKEN,
  };
}

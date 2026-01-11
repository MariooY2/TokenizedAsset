import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import IdentityRegistryABI from '../abi/IdentityRegistry.json';
import { Identity } from '../types/contracts';

export function useIdentityRegistry() {
  const { writeContractAsync } = useWriteContract();

  // Read: Check if address is verified
  const useIsVerified = (address?: `0x${string}`) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.identityRegistry,
      abi: IdentityRegistryABI,
      functionName: 'isVerified',
      args: address ? [address] : undefined,
      query: {
        enabled: !!address,
      },
    });
  };

  // Read: Get identity details
  const useGetIdentity = (address?: `0x${string}`) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.identityRegistry,
      abi: IdentityRegistryABI,
      functionName: 'getIdentity',
      args: address ? [address] : undefined,
      query: {
        enabled: !!address,
      },
    });
  };

  // Write: Add to whitelist (admin only)
  const addToWhitelist = async (
    investor: `0x${string}`,
    expiryDate: bigint,
    country: string
  ) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.identityRegistry,
      abi: IdentityRegistryABI,
      functionName: 'addToWhitelist',
      args: [investor, expiryDate, country],
    });
    return hash;
  };

  // Write: Remove from whitelist (admin only)
  const removeFromWhitelist = async (investor: `0x${string}`) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.identityRegistry,
      abi: IdentityRegistryABI,
      functionName: 'removeFromWhitelist',
      args: [investor],
    });
    return hash;
  };

  // Write: Renew KYC (admin only)
  const renewKYC = async (investor: `0x${string}`, newExpiry: bigint) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.identityRegistry,
      abi: IdentityRegistryABI,
      functionName: 'renewKYC',
      args: [investor, newExpiry],
    });
    return hash;
  };

  return {
    useIsVerified,
    useGetIdentity,
    addToWhitelist,
    removeFromWhitelist,
    renewKYC,
  };
}

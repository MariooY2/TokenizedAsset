import { useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import ArtSecurityTokenABI from '../abi/ArtSecurityToken.json';
import { formatUnits } from 'viem';

export function useArtSecurityToken() {
  const { writeContractAsync } = useWriteContract();

  // Read: Token balance
  const useBalanceOf = (address?: `0x${string}`) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.artSecurityToken,
      abi: ArtSecurityTokenABI,
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
      query: {
        enabled: !!address,
      },
    });
  };

  // Read: Total supply
  const useTotalSupply = () => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.artSecurityToken,
      abi: ArtSecurityTokenABI,
      functionName: 'totalSupply',
    });
  };

  // Read: Token metadata
  const useTokenInfo = () => {
    const { data: name } = useReadContract({
      address: CONTRACT_ADDRESSES.artSecurityToken,
      abi: ArtSecurityTokenABI,
      functionName: 'name',
    });

    const { data: symbol } = useReadContract({
      address: CONTRACT_ADDRESSES.artSecurityToken,
      abi: ArtSecurityTokenABI,
      functionName: 'symbol',
    });

    const { data: artworkName } = useReadContract({
      address: CONTRACT_ADDRESSES.artSecurityToken,
      abi: ArtSecurityTokenABI,
      functionName: 'artworkName',
    });

    const { data: artist } = useReadContract({
      address: CONTRACT_ADDRESSES.artSecurityToken,
      abi: ArtSecurityTokenABI,
      functionName: 'artist',
    });

    const { data: creationYear } = useReadContract({
      address: CONTRACT_ADDRESSES.artSecurityToken,
      abi: ArtSecurityTokenABI,
      functionName: 'creationYear',
    });

    const { data: initialValuation } = useReadContract({
      address: CONTRACT_ADDRESSES.artSecurityToken,
      abi: ArtSecurityTokenABI,
      functionName: 'initialValuation',
    });

    const { data: transfersEnabled } = useReadContract({
      address: CONTRACT_ADDRESSES.artSecurityToken,
      abi: ArtSecurityTokenABI,
      functionName: 'transfersEnabled',
    });

    return {
      name: name as string | undefined,
      symbol: symbol as string | undefined,
      artworkName: artworkName as string | undefined,
      artist: artist as string | undefined,
      creationYear: creationYear as bigint | undefined,
      initialValuation: initialValuation as bigint | undefined,
      transfersEnabled: transfersEnabled as boolean | undefined,
    };
  };

  // Read: Check if address is compliant
  const useIsCompliant = (address?: `0x${string}`) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.artSecurityToken,
      abi: ArtSecurityTokenABI,
      functionName: 'isCompliant',
      args: address ? [address] : undefined,
      query: {
        enabled: !!address,
      },
    });
  };

  // Write: Transfer tokens
  const transfer = async (to: `0x${string}`, amount: bigint) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.artSecurityToken,
      abi: ArtSecurityTokenABI,
      functionName: 'transfer',
      args: [to, amount],
    });
    return hash;
  };

  // Write: Approve spender
  const approve = async (spender: `0x${string}`, amount: bigint) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.artSecurityToken,
      abi: ArtSecurityTokenABI,
      functionName: 'approve',
      args: [spender, amount],
    });
    return hash;
  };

  return {
    useBalanceOf,
    useTotalSupply,
    useTokenInfo,
    useIsCompliant,
    transfer,
    approve,
  };
}

import { useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import GovernanceABI from '../abi/GovernanceContract.json';
import { ProposalInfo } from '../types/contracts';

export function useGovernance() {
  const { writeContractAsync } = useWriteContract();

  // Read: Get proposal
  const useGetProposal = (proposalId?: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.governance,
      abi: GovernanceABI,
      functionName: 'getProposal',
      args: proposalId !== undefined ? [proposalId] : undefined,
      query: {
        enabled: proposalId !== undefined,
      },
    });
  };

  // Read: Proposal count
  const useProposalCount = () => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.governance,
      abi: GovernanceABI,
      functionName: 'proposalCount',
    });
  };

  // Read: Has voted
  const useHasVoted = (proposalId?: bigint, voter?: `0x${string}`) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.governance,
      abi: GovernanceABI,
      functionName: 'hasVoted',
      args: proposalId !== undefined && voter ? [proposalId, voter] : undefined,
      query: {
        enabled: proposalId !== undefined && !!voter,
      },
    });
  };

  // Read: Has proposal passed
  const useHasProposalPassed = (proposalId?: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.governance,
      abi: GovernanceABI,
      functionName: 'hasProposalPassed',
      args: proposalId !== undefined ? [proposalId] : undefined,
      query: {
        enabled: proposalId !== undefined,
      },
    });
  };

  // Read: Governance tokens
  const useGovernanceTokens = (address?: `0x${string}`) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.governance,
      abi: GovernanceABI,
      functionName: 'governanceTokens',
      args: address ? [address] : undefined,
      query: {
        enabled: !!address,
      },
    });
  };

  // Write: Create proposal
  const createProposal = async (
    proposalType: number,
    description: string,
    data: `0x${string}`
  ) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.governance,
      abi: GovernanceABI,
      functionName: 'createProposal',
      args: [proposalType, description, data],
    });
    return hash;
  };

  // Write: Vote on proposal
  const vote = async (proposalId: bigint, support: boolean) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.governance,
      abi: GovernanceABI,
      functionName: 'vote',
      args: [proposalId, support],
    });
    return hash;
  };

  // Write: Execute proposal
  const executeProposal = async (proposalId: bigint) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.governance,
      abi: GovernanceABI,
      functionName: 'executeProposal',
      args: [proposalId],
    });
    return hash;
  };

  // Write: Cancel proposal
  const cancelProposal = async (proposalId: bigint) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.governance,
      abi: GovernanceABI,
      functionName: 'cancelProposal',
      args: [proposalId],
    });
    return hash;
  };

  return {
    useGetProposal,
    useProposalCount,
    useHasVoted,
    useHasProposalPassed,
    useGovernanceTokens,
    createProposal,
    vote,
    executeProposal,
    cancelProposal,
  };
}

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useGovernance } from '@/src/hooks/useGovernance';
import { ProposalType, ProposalStatus } from '@/src/types/contracts';
import { formatDate, timeUntil } from '@/src/lib/utils';
import { Vote, CheckCircle, XCircle, Scale, PlayCircle } from 'lucide-react';
import { encodeAbiParameters } from 'viem';
import { Modal } from './Modal';

export function Governance() {
  const { address } = useAccount();
  const {
    useGetProposal,
    useProposalCount,
    useHasVoted,
    useGovernanceTokens,
    createProposal,
    vote,
    executeProposal,
  } = useGovernance();

  const [selectedProposalId, setSelectedProposalId] = useState<string>('1');
  const [newProposalType, setNewProposalType] = useState<number>(ProposalType.ENABLE_TRANSFERS);
  const [newProposalDesc, setNewProposalDesc] = useState('');
  const [enableTransfersValue, setEnableTransfersValue] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
    title?: string;
  }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const { data: proposalCount } = useProposalCount();
  const { data: proposal } = useGetProposal(
    selectedProposalId ? BigInt(selectedProposalId) : undefined
  );
  const { data: hasVoted } = useHasVoted(
    selectedProposalId ? BigInt(selectedProposalId) : undefined,
    address
  );
  const { data: governanceTokens } = useGovernanceTokens(address);

  const canVote = governanceTokens && Array.isArray(governanceTokens) && governanceTokens[2];

  const handleCreateProposal = async () => {
    if (!newProposalDesc) return;

    try {
      setLoading(true);

      let data: `0x${string}` = '0x';
      if (newProposalType === ProposalType.ENABLE_TRANSFERS) {
        data = encodeAbiParameters(
          [{ type: 'bool' }],
          [enableTransfersValue]
        );
      }

      await createProposal(newProposalType, newProposalDesc, data);
      setModalState({
        isOpen: true,
        message: 'Proposal submitted successfully.',
        type: 'success',
        title: 'Proposal Created',
      });
      setNewProposalDesc('');
    } catch (error: unknown) {
      setModalState({
        isOpen: true,
        message: error instanceof Error ? error.message : 'Failed to submit proposal',
        type: 'error',
        title: 'Submission Failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (support: boolean) => {
    if (!selectedProposalId) return;

    try {
      setLoading(true);
      await vote(BigInt(selectedProposalId), support);
      setModalState({
        isOpen: true,
        message: `Vote ${support ? 'in favor' : 'against'} recorded successfully.`,
        type: 'success',
        title: 'Vote Recorded',
      });
    } catch (error: unknown) {
      setModalState({
        isOpen: true,
        message: error instanceof Error ? error.message : 'Failed to record vote',
        type: 'error',
        title: 'Vote Failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!selectedProposalId) return;

    try {
      setLoading(true);
      await executeProposal(BigInt(selectedProposalId));
      setModalState({
        isOpen: true,
        message: 'Proposal executed successfully.',
        type: 'success',
        title: 'Executed',
      });
    } catch (error: unknown) {
      setModalState({
        isOpen: true,
        message: error instanceof Error ? error.message : 'Failed to execute proposal',
        type: 'error',
        title: 'Execution Failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const getProposalTypeName = (type: number) => {
    switch (type) {
      case ProposalType.EXIT_SALE:
        return 'Asset Liquidation';
      case ProposalType.EMERGENCY_PAUSE:
        return 'Emergency Suspension';
      case ProposalType.ENABLE_TRANSFERS:
        return 'Transfer Authorization';
      default:
        return 'Unknown';
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case ProposalStatus.Active:
        return <span className="px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#8B6914] rounded-lg text-xs font-light tracking-widest uppercase">Active</span>;
      case ProposalStatus.Executed:
        return <span className="px-3 py-1.5 bg-[#A8B5A0]/20 border border-[#A8B5A0]/40 text-[#4A3F35] rounded-lg text-xs font-light tracking-widest uppercase">Executed</span>;
      case ProposalStatus.Rejected:
        return <span className="px-3 py-1.5 bg-[#4A3F35]/10 border border-[#4A3F35]/30 text-[#4A3F35] rounded-lg text-xs font-light tracking-widest uppercase">Rejected</span>;
      case ProposalStatus.Cancelled:
        return <span className="px-3 py-1.5 bg-[#E8DCC4] border border-[#E8DCC4] text-[#8B6914] rounded-lg text-xs font-light tracking-widest uppercase">Cancelled</span>;
      default:
        return <span className="px-3 py-1.5 bg-[#E8DCC4] border border-[#E8DCC4] text-[#8B6914] rounded-lg text-xs font-light tracking-widest uppercase">Pending</span>;
    }
  };

  const totalVotes = proposal && Array.isArray(proposal) ? proposal[6] + proposal[7] : BigInt(0);
  const votesForPercentage = totalVotes > BigInt(0) && proposal && Array.isArray(proposal) ? Number((proposal[6] * BigInt(100)) / totalVotes) : 0;
  const votesAgainstPercentage = totalVotes > BigInt(0) && proposal && Array.isArray(proposal) ? Number((proposal[7] * BigInt(100)) / totalVotes) : 0;

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-[#D4AF37]/30 rounded-2xl shadow-2xl p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-xl blur-sm"></div>
          <div className="relative p-3 bg-linear-to-br from-[#D4AF37]/20 to-[#8B6914]/10 rounded-xl border border-[#D4AF37]/40">
            <Scale className="w-7 h-7 text-[#D4AF37]" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
            Governance Council
          </h2>
          <p className="text-sm text-[#8B6914] font-light tracking-wide">Member Voting & Proposals</p>
        </div>
      </div>

      {governanceTokens && Array.isArray(governanceTokens) && governanceTokens.length >= 3 ? (
        <div className="mb-6 p-6 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">Your Voting Power</div>
              <div className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
                {typeof governanceTokens[1] === 'bigint' ? Number(governanceTokens[1]) / 100 : 0}%
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl border ${governanceTokens[2] ? 'bg-[#A8B5A0]/20 border-[#A8B5A0]/40 text-[#4A3F35]' : 'bg-[#E8DCC4] border-[#E8DCC4] text-[#8B6914]'}`}>
              <span className="text-sm font-light tracking-wide">{governanceTokens[2] ? '✓ Voting Eligible' : 'Ineligible'}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-[#2C2416] mb-4 text-lg" style={{fontFamily: "'Playfair Display', serif"}}>
            View Proposals
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-light text-[#4A3F35] mb-3 tracking-wide">
                Proposal Number (Total: {proposalCount ? Number(proposalCount) : 0})
              </label>
              <input
                type="number"
                placeholder="1"
                value={selectedProposalId}
                onChange={(e) => setSelectedProposalId(e.target.value)}
                min="1"
                className="w-full px-5 py-3 bg-white border-2 border-[#E8DCC4] text-[#2C2416] placeholder-[#8B6914]/40 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-all"
                style={{fontFamily: "'Playfair Display', serif"}}
              />
            </div>

            {proposal && Array.isArray(proposal) ? (
              <div className="border-2 border-[#E8DCC4] bg-[#FAF8F3] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC4]">
                  <h4 className="font-bold text-[#2C2416] text-lg" style={{fontFamily: "'Playfair Display', serif"}}>
                    Proposal #{String(proposal[0])}
                  </h4>
                  {getStatusBadge(proposal[8])}
                </div>

                <div className="text-sm space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#8B6914] uppercase tracking-widest font-light text-xs">Type</span>
                    <span className="font-medium text-[#2C2416]">{getProposalTypeName(proposal[1])}</span>
                  </div>
                  <div>
                    <span className="text-[#8B6914] uppercase tracking-widest font-light text-xs">Description</span>
                    <p className="mt-2 text-[#2C2416] font-light leading-relaxed">{proposal[2]}</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B6914] uppercase tracking-widest font-light text-xs">Voting Closes</span>
                    <span className="font-medium text-[#2C2416]">{timeUntil(proposal[5])}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#A8B5A0] font-light">In Favor: {votesForPercentage.toFixed(1)}%</span>
                      <span className="font-medium text-[#2C2416]">{String(proposal[6])}</span>
                    </div>
                    <div className="w-full bg-[#E8DCC4] rounded-full h-2">
                      <div
                        className="bg-[#A8B5A0] h-2 rounded-full transition-all"
                        style={{ width: `${votesForPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#8B6914] font-light">Against: {votesAgainstPercentage.toFixed(1)}%</span>
                      <span className="font-medium text-[#2C2416]">{String(proposal[7])}</span>
                    </div>
                    <div className="w-full bg-[#E8DCC4] rounded-full h-2">
                      <div
                        className="bg-[#8B6914] h-2 rounded-full transition-all"
                        style={{ width: `${votesAgainstPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {Array.isArray(proposal) && proposal[8] === ProposalStatus.Active && !hasVoted && canVote && (
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <button
                      onClick={() => handleVote(true)}
                      disabled={loading}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#A8B5A0]/20 border-2 border-[#A8B5A0]/40 text-[#4A3F35] rounded-xl hover:bg-[#A8B5A0]/30 disabled:opacity-40 transition-all font-light tracking-wide"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>In Favor</span>
                    </button>
                    <button
                      onClick={() => handleVote(false)}
                      disabled={loading}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#4A3F35]/10 border-2 border-[#4A3F35]/30 text-[#4A3F35] rounded-xl hover:bg-[#4A3F35]/20 disabled:opacity-40 transition-all font-light tracking-wide"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Against</span>
                    </button>
                  </div>
                )}

                {hasVoted && (
                  <div className="pt-2 text-sm text-[#8B6914] text-center font-light">
                    You have cast your vote on this proposal
                  </div>
                )}

                {Array.isArray(proposal) && proposal[8] === ProposalStatus.Active &&
                  BigInt(Math.floor(Date.now() / 1000)) > proposal[5] &&
                  proposal[6] > proposal[7] && (
                    <button
                      onClick={handleExecute}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-linear-to-r from-[#D4AF37] to-[#B8941F] border-2 border-[#8B6914]/20 text-white rounded-xl hover:from-[#B8941F] hover:to-[#D4AF37] disabled:opacity-40 transition-all font-medium tracking-wide shadow-lg"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Execute Proposal</span>
                    </button>
                  )}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-[#2C2416] mb-4 text-lg" style={{fontFamily: "'Playfair Display', serif"}}>
            Submit Proposal
          </h3>

          {!canVote ? (
            <div className="p-5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl">
              <p className="text-sm text-[#4A3F35] font-light leading-relaxed">
                Governance participation requires verified membership and share ownership.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-light text-[#4A3F35] mb-3 tracking-wide">
                  Proposal Category
                </label>
                <select
                  value={newProposalType}
                  onChange={(e) => setNewProposalType(Number(e.target.value))}
                  className="w-full px-5 py-3 bg-white border-2 border-[#E8DCC4] text-[#2C2416] rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-all"
                  style={{fontFamily: "'Playfair Display', serif"}}
                >
                  <option value={ProposalType.ENABLE_TRANSFERS}>Transfer Authorization</option>
                  <option value={ProposalType.EMERGENCY_PAUSE}>Emergency Suspension</option>
                  <option value={ProposalType.EXIT_SALE}>Asset Liquidation</option>
                </select>
              </div>

              {newProposalType === ProposalType.ENABLE_TRANSFERS && (
                <div>
                  <label className="block text-sm font-light text-[#4A3F35] mb-3 tracking-wide">
                    Transfer Status
                  </label>
                  <select
                    value={enableTransfersValue ? 'true' : 'false'}
                    onChange={(e) => setEnableTransfersValue(e.target.value === 'true')}
                    className="w-full px-5 py-3 bg-white border-2 border-[#E8DCC4] text-[#2C2416] rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-all"
                    style={{fontFamily: "'Playfair Display', serif"}}
                  >
                    <option value="true">Enable Transfers</option>
                    <option value="false">Disable Transfers</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-light text-[#4A3F35] mb-3 tracking-wide">
                  Proposal Description
                </label>
                <textarea
                  placeholder="Provide detailed rationale for this proposal..."
                  value={newProposalDesc}
                  onChange={(e) => setNewProposalDesc(e.target.value)}
                  rows={4}
                  className="w-full px-5 py-3 bg-white border-2 border-[#E8DCC4] text-[#2C2416] placeholder-[#8B6914]/40 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-all font-light"
                />
              </div>

              <button
                onClick={handleCreateProposal}
                disabled={loading || !newProposalDesc}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-linear-to-r from-[#D4AF37] to-[#B8941F] border-2 border-[#8B6914]/20 text-white hover:from-[#B8941F] hover:to-[#D4AF37] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium tracking-wide rounded-xl shadow-lg"
              >
                <Vote className="w-5 h-5" />
                <span>{loading ? 'Submitting...' : 'Submit Proposal'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        message={modalState.message}
        type={modalState.type}
        title={modalState.title}
      />
    </div>
  );
}

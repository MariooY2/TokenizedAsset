'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useArtSecurityToken } from '@/src/hooks/useArtSecurityToken';
import { formatTokenAmount, formatUSDC, parseTokenAmount, formatCurrency, formatNumber } from '@/src/lib/utils';
import { Briefcase, Send, ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import { Modal } from './Modal';

export function TokenDashboard() {
  const { address } = useAccount();
  const {
    useBalanceOf,
    useTotalSupply,
    useTokenInfo,
    useIsCompliant,
    transfer,
  } = useArtSecurityToken();

  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
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

  const { data: balance } = useBalanceOf(address);
  const { data: totalSupply } = useTotalSupply();
  const { data: isCompliant } = useIsCompliant(address);
  const tokenInfo = useTokenInfo();

  const handleTransfer = async () => {
    if (!recipientAddress || !transferAmount) return;

    try {
      setLoading(true);
      const amount = parseTokenAmount(transferAmount);
      await transfer(recipientAddress as `0x${string}`, amount);
      setModalState({
        isOpen: true,
        message: 'Transfer completed successfully.',
        type: 'success',
        title: 'Transfer Complete',
      });
      setRecipientAddress('');
      setTransferAmount('');
    } catch (error: unknown) {
      setModalState({
        isOpen: true,
        message: error instanceof Error ? error.message : 'Transfer failed',
        type: 'error',
        title: 'Transfer Failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const ownership = balance && totalSupply
    ? (Number(balance) / Number(totalSupply)) * 100
    : 0;

  const estimatedValue = balance && tokenInfo.initialValuation && typeof tokenInfo.initialValuation === 'bigint'
    ? (Number(balance) / Number(totalSupply || BigInt(1))) *
      Number(formatUSDC(tokenInfo.initialValuation))
    : 0;

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-[#D4AF37]/30 rounded-2xl shadow-2xl p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-xl blur-sm"></div>
          <div className="relative p-3 bg-linear-to-br from-[#D4AF37]/20 to-[#8B6914]/10 rounded-xl border border-[#D4AF37]/40">
            <Briefcase className="w-7 h-7 text-[#D4AF37]" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
            Your Portfolio
          </h2>
          <p className="text-sm text-[#8B6914] font-light tracking-wide">Holdings & Ownership Details</p>
        </div>
      </div>

      {/* Artwork Info */}
      <div className="mb-6 p-6 bg-[#FAF8F3] rounded-xl border border-[#E8DCC4]">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl">
            <ImageIcon className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-1 text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
              {tokenInfo.artworkName || 'Loading...'}
            </h3>
            <p className="text-[#4A3F35] mb-3 font-light">
              by {tokenInfo.artist || 'Unknown'} •{' '}
              {tokenInfo.creationYear ? Number(tokenInfo.creationYear) : '—'}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-[#8B6914] uppercase tracking-widest font-light text-xs">Valuation</span>
                <span className="ml-2 font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
                  {tokenInfo.initialValuation && typeof tokenInfo.initialValuation === 'bigint'
                    ? formatCurrency(Number(formatUSDC(tokenInfo.initialValuation)))
                    : '—'}
                </span>
              </div>
              <div>
                <span className="text-[#8B6914] uppercase tracking-widest font-light text-xs">Transfers</span>
                <span
                  className={`ml-2 font-medium ${
                    tokenInfo.transfersEnabled ? 'text-[#A8B5A0]' : 'text-[#8B6914]'
                  }`}
                >
                  {tokenInfo.transfersEnabled ? 'Active' : 'Restricted'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <div className="p-5 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
          <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">Your Shares</div>
          <div className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
            {balance && typeof balance === 'bigint' ? formatNumber(formatTokenAmount(balance)) : '0'}
          </div>
        </div>

        <div className="p-5 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
          <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">Ownership Stake</div>
          <div className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
            {ownership.toFixed(3)}%
          </div>
        </div>

        <div className="p-5 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
          <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">Portfolio Value</div>
          <div className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
            {formatCurrency(estimatedValue)}
          </div>
        </div>

        <div className="p-5 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
          <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">Total Supply</div>
          <div className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
            {totalSupply && typeof totalSupply === 'bigint' ? formatNumber(formatTokenAmount(totalSupply)) : '0'}
          </div>
        </div>
      </div>

      {/* Compliance Status */}
      <div className={`mb-6 p-5 rounded-xl border-2 ${isCompliant ? 'bg-[#A8B5A0]/10 border-[#A8B5A0]/40' : 'bg-[#D4AF37]/10 border-[#D4AF37]/30'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isCompliant ? (
              <CheckCircle className="w-6 h-6 text-[#A8B5A0]" />
            ) : (
              <XCircle className="w-6 h-6 text-[#8B6914]" />
            )}
            <span className={`text-sm font-light tracking-wide ${isCompliant ? 'text-[#4A3F35]' : 'text-[#8B6914]'}`}>
              Compliance Status
            </span>
          </div>
          <span className={`font-bold text-lg ${isCompliant ? 'text-[#4A3F35]' : 'text-[#8B6914]'}`} style={{fontFamily: "'Playfair Display', serif"}}>
            {isCompliant ? 'Verified' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Transfer Section */}
      <div className="space-y-5">
        <h3 className="font-bold text-[#2C2416] text-lg" style={{fontFamily: "'Playfair Display', serif"}}>
          Transfer Shares
        </h3>

        {!tokenInfo.transfersEnabled && (
          <div className="p-5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl">
            <p className="text-sm text-[#4A3F35] font-light leading-relaxed">
              Share transfers are currently restricted. Transfers may be enabled through governance approval or during designated liquidity windows.
            </p>
          </div>
        )}

        <input
          type="text"
          placeholder="Recipient Address (0x...)"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className="w-full px-5 py-4 bg-white border-2 border-[#E8DCC4] text-[#2C2416] placeholder-[#8B6914]/40 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-all"
          disabled={!tokenInfo.transfersEnabled || !isCompliant}
        />

        <input
          type="number"
          placeholder="Number of Shares"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          className="w-full px-5 py-4 bg-white border-2 border-[#E8DCC4] text-[#2C2416] placeholder-[#8B6914]/40 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-all text-lg"
          disabled={!tokenInfo.transfersEnabled || !isCompliant}
          style={{fontFamily: "'Playfair Display', serif"}}
        />

        <button
          onClick={handleTransfer}
          disabled={
            loading ||
            !tokenInfo.transfersEnabled ||
            !isCompliant ||
            !recipientAddress ||
            !transferAmount
          }
          className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-linear-to-r from-[#D4AF37] to-[#B8941F] border-2 border-[#8B6914]/20 text-white hover:from-[#B8941F] hover:to-[#D4AF37] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium tracking-wide rounded-xl shadow-lg"
        >
          <Send className="w-5 h-5" />
          <span>{loading ? 'Processing Transfer...' : 'Execute Transfer'}</span>
        </button>
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

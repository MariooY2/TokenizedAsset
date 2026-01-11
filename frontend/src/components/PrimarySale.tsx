'use client';

import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { usePrimarySale } from '../hooks/usePrimarySale';
import { useIdentityRegistry } from '../hooks/useIdentityRegistry';
import { formatTokenAmount, formatUSDC, parseTokenAmount, formatCurrency, formatNumber } from '../lib/utils';
import { Sparkles, Check, Lock } from 'lucide-react';
import USDCABI from '../abi/USDC.json';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { Modal } from './Modal';

export function PrimarySale() {
  const { address } = useAccount();
  const {
    buyTokens,
    approveUSDC,
    useRemainingTokens,
    useTotalSold,
    useSaleActive,
    useCalculateCost,
    PRICE_PER_TOKEN,
  } = usePrimarySale();

  const { useIsVerified } = useIdentityRegistry();

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'approve' | 'buy'>('input');
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

  const { data: isVerified } = useIsVerified(address);
  const { data: remainingTokens } = useRemainingTokens();
  const { data: totalSold } = useTotalSold();
  const { data: saleActive } = useSaleActive();

  const astAmount = amount ? parseTokenAmount(amount) : 0n;
  const { data: cost } = useCalculateCost(astAmount);

  const { data: usdcBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.usdc,
    abi: USDCABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.usdc,
    abi: USDCABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESSES.primarySale] : undefined,
  });

  const handleApprove = async () => {
    if (!cost || typeof cost !== 'bigint') return;

    try {
      setLoading(true);
      // Approve max amount so user only needs to approve once
      const maxApproval = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
      await approveUSDC(maxApproval);
      await refetchAllowance();
      setModalState({
        isOpen: true,
        message: 'Authorization complete. You may now proceed with acquisition.',
        type: 'success',
        title: 'Authorized',
      });
    } catch (error: unknown) {
      setModalState({
        isOpen: true,
        message: error instanceof Error ? error.message : 'Authorization failed',
        type: 'error',
        title: 'Authorization Failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!astAmount) return;

    try {
      setLoading(true);
      await buyTokens(astAmount);
      setModalState({
        isOpen: true,
        message: 'Acquisition successful. Welcome to the collection.',
        type: 'success',
        title: 'Success',
      });
      setAmount('');
      setStep('input');
    } catch (error: unknown) {
      setModalState({
        isOpen: true,
        message: error instanceof Error ? error.message : 'Acquisition failed',
        type: 'error',
        title: 'Acquisition Failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = totalSold && typeof totalSold === 'bigint'
    ? Number((totalSold * 100n) / (2000n * 10n ** 18n))
    : 0;

  const needsApproval = cost && typeof cost === 'bigint' && usdcAllowance !== undefined && usdcAllowance !== null && typeof usdcAllowance === 'bigint' && usdcAllowance < cost;

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-[#D4AF37]/30 rounded-2xl shadow-2xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-xl blur-sm"></div>
            <div className="relative p-3 bg-linear-to-br from-[#D4AF37]/20 to-[#8B6914]/10 rounded-xl border border-[#D4AF37]/40">
              <Sparkles className="w-7 h-7 text-[#D4AF37]" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
              Exclusive Offering
            </h2>
            <p className="text-sm text-[#8B6914] font-light tracking-wide">Picasso&apos;s Fillette au béret</p>
          </div>
        </div>
        {saleActive ? (
          <span className="px-4 py-2 bg-[#A8B5A0]/20 border border-[#A8B5A0]/40 text-[#4A3F35] rounded-xl text-xs font-light tracking-widest uppercase">
            Available
          </span>
        ) : null}
      </div>

      {/* Sale Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="p-5 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
          <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">Price per Share</div>
          <div className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
            {formatCurrency(Number(formatUSDC(PRICE_PER_TOKEN)))}
          </div>
        </div>

        <div className="p-5 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
          <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">Shares Remaining</div>
          <div className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
            {remainingTokens && typeof remainingTokens === 'bigint' ? formatNumber(formatTokenAmount(remainingTokens)) : '0'}
          </div>
        </div>

        <div className="p-5 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
          <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">Shares Acquired</div>
          <div className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
            {totalSold && typeof totalSold === 'bigint' ? formatNumber(formatTokenAmount(totalSold)) : '0'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-[#4A3F35] mb-3 font-light">
          <span className="tracking-wide">Offering Progress</span>
          <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-[#E8DCC4] rounded-full h-2 overflow-hidden">
          <div
            className="bg-linear-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6914] rounded-full h-2 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* KYC Check */}
      {!isVerified && (
        <div className="mb-6 p-5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-[#8B6914] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#4A3F35] font-light leading-relaxed">
              Membership verification required. Please complete the verification process to participate in this exclusive offering.
            </p>
          </div>
        </div>
      )}

      {/* Your Balance */}
      {usdcBalance !== undefined && usdcBalance !== null && typeof usdcBalance === 'bigint' ? (
        <div className="mb-6 p-5 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
          <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">Available Balance</div>
          <div className="text-2xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
            {formatCurrency(Number(formatUSDC(usdcBalance)))}
          </div>
        </div>
      ) : null}

      {/* Acquisition Form */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-light text-[#4A3F35] mb-3 tracking-wide">
            Number of Shares
          </label>
          <input
            type="number"
            placeholder="10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-5 py-4 bg-white border-2 border-[#E8DCC4] text-[#2C2416] placeholder-[#8B6914]/40 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-all text-lg"
            disabled={!saleActive || !isVerified}
            style={{fontFamily: "'Playfair Display', serif"}}
          />
        </div>

        {cost && typeof cost === 'bigint' && cost > 0n ? (
          <div className="p-6 bg-linear-to-br from-[#D4AF37]/10 to-[#8B6914]/5 border-2 border-[#D4AF37]/40 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#4A3F35] uppercase tracking-widest font-light">Investment Amount</span>
              <span className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
                {formatCurrency(Number(formatUSDC(cost)))}
              </span>
            </div>
          </div>
        ) : null}

        {needsApproval ? (
          <button
            onClick={handleApprove}
            disabled={loading || !isVerified || !saleActive || !amount}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-[#D4AF37]/20 border-2 border-[#D4AF37]/60 text-[#8B6914] hover:bg-[#D4AF37]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-light tracking-wide rounded-xl text-base"
          >
            <Lock className="w-5 h-5" />
            <span>{loading ? 'Authorizing...' : 'Authorize Transaction'}</span>
          </button>
        ) : (
          <button
            onClick={handleBuy}
            disabled={loading || !isVerified || !saleActive || !amount}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-linear-to-r from-[#D4AF37] to-[#B8941F] border-2 border-[#8B6914]/20 text-white hover:from-[#B8941F] hover:to-[#D4AF37] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium tracking-wide rounded-xl text-base shadow-lg"
          >
            <Check className="w-5 h-5" />
            <span>{loading ? 'Processing...' : 'Complete Acquisition'}</span>
          </button>
        )}

        {!saleActive && (
          <p className="text-sm text-center text-[#8B6914] font-light tracking-wide">
            This offering is currently unavailable
          </p>
        )}
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

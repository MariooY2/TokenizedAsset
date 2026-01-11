'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useExitDistribution } from '../hooks/useExitDistribution';
import { useArtSecurityToken } from '../hooks/useArtSecurityToken';
import { formatTokenAmount, formatUSDC, parseTokenAmount, formatCurrency, formatNumber } from '../lib/utils';
import { TrendingUp, Award, Coins } from 'lucide-react';
import { Modal } from './Modal';

export function ExitDistribution() {
  const { address } = useAccount();
  const {
    redeem,
    useCalculateRedemption,
    useFinalPricePerToken,
    useTotalProceeds,
    useTotalRedeemed,
    useProceedsDeposited,
    useRemainingProceeds,
    useCalculateReturn,
  } = useExitDistribution();

  const { useBalanceOf } = useArtSecurityToken();

  const [redeemAmount, setRedeemAmount] = useState('');
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
  const { data: proceedsDeposited } = useProceedsDeposited();
  const { data: totalProceeds } = useTotalProceeds();
  const { data: totalRedeemed } = useTotalRedeemed();
  const { data: remainingProceeds } = useRemainingProceeds();
  const { data: finalPrice } = useFinalPricePerToken();

  const astAmount = redeemAmount ? parseTokenAmount(redeemAmount) : BigInt(0);
  const { data: redemptionValue } = useCalculateRedemption(astAmount);

  const initialInvestment = astAmount ? (astAmount * BigInt(2000) * BigInt(10) ** BigInt(6)) / BigInt(10) ** BigInt(18) : BigInt(0);
  const { data: returnBps } = useCalculateReturn(initialInvestment);

  const handleRedeem = async () => {
    if (!astAmount) return;

    try {
      setLoading(true);
      await redeem(astAmount);
      setModalState({
        isOpen: true,
        message: 'Liquidation complete. Proceeds have been transferred to your account.',
        type: 'success',
        title: 'Liquidation Complete',
      });
      setRedeemAmount('');
    } catch (error: unknown) {
      setModalState({
        isOpen: true,
        message: error instanceof Error ? error.message : 'Liquidation failed',
        type: 'error',
        title: 'Liquidation Failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const returnPercentage = returnBps && typeof returnBps === 'bigint' ? Number(returnBps) / 100 : 0;

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-[#D4AF37]/30 rounded-2xl shadow-2xl p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-[#8B6914]/20 rounded-xl blur-sm"></div>
          <div className="relative p-3 bg-gradient-to-br from-[#8B6914]/20 to-[#D4AF37]/10 rounded-xl border border-[#8B6914]/40">
            <Coins className="w-7 h-7 text-[#8B6914]" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
            Asset Liquidation
          </h2>
          <p className="text-sm text-[#8B6914] font-light tracking-wide">Exit & Proceeds Distribution</p>
        </div>
      </div>

      {!proceedsDeposited ? (
        <div className="p-8 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl text-center">
          <p className="text-[#4A3F35] font-light leading-relaxed">
            The liquidation facility is not yet available. Proceeds will be deposited following the successful sale of the artwork.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <div className="p-5 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
              <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">Total Proceeds</div>
              <div className="text-2xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
                {totalProceeds && typeof totalProceeds === 'bigint' ? formatCurrency(Number(formatUSDC(totalProceeds))) : '$0'}
              </div>
            </div>

            <div className="p-5 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
              <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">Final Price / Share</div>
              <div className="text-2xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
                {finalPrice && typeof finalPrice === 'bigint' ? formatCurrency(Number(formatUSDC(finalPrice))) : '$0'}
              </div>
            </div>

            <div className="p-5 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
              <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">Total Liquidated</div>
              <div className="text-2xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
                {totalRedeemed && typeof totalRedeemed === 'bigint' ? formatCurrency(Number(formatUSDC(totalRedeemed))) : '$0'}
              </div>
            </div>

            <div className="p-5 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
              <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">Remaining</div>
              <div className="text-2xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
                {remainingProceeds && typeof remainingProceeds === 'bigint' ? formatCurrency(Number(formatUSDC(remainingProceeds))) : '$0'}
              </div>
            </div>
          </div>

          <div className="mb-6 p-6 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">Your Holdings</div>
                <div className="text-2xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
                  {balance && typeof balance === 'bigint' ? formatNumber(formatTokenAmount(balance)) : '0'} Shares
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">Liquidation Value</div>
                <div className="text-2xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
                  {balance && finalPrice && typeof balance === 'bigint' && typeof finalPrice === 'bigint'
                    ? formatCurrency(Number(formatUSDC((balance * finalPrice) / BigInt(10) ** BigInt(18))))
                    : '$0'}
                </div>
              </div>
            </div>
          </div>

          {returnBps && typeof returnBps === 'bigint' && returnBps > BigInt(0) ? (
            <div className="mb-6 p-5 bg-[#A8B5A0]/10 border border-[#A8B5A0]/40 rounded-xl">
              <div className="flex items-center space-x-3">
                <Award className="w-6 h-6 text-[#4A3F35]" />
                <div>
                  <div className="text-xs text-[#8B6914] uppercase tracking-widest font-light">Estimated Return</div>
                  <div className="text-3xl font-bold text-[#4A3F35]" style={{fontFamily: "'Playfair Display', serif"}}>
                    +{returnPercentage.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-5">
            <h3 className="font-bold text-[#2C2416] text-lg" style={{fontFamily: "'Playfair Display', serif"}}>
              Liquidate Holdings
            </h3>

            <div>
              <label className="block text-sm font-light text-[#4A3F35] mb-3 tracking-wide">
                Number of Shares to Liquidate
              </label>
              <input
                type="number"
                placeholder="10"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                max={balance && typeof balance === 'bigint' ? formatTokenAmount(balance) : '0'}
                className="w-full px-5 py-4 bg-white border-2 border-[#E8DCC4] text-[#2C2416] placeholder-[#8B6914]/40 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-all text-lg"
                style={{fontFamily: "'Playfair Display', serif"}}
              />
              {balance && typeof balance === 'bigint' ? (
                <button
                  onClick={() => setRedeemAmount(formatTokenAmount(balance))}
                  className="mt-3 text-sm text-[#8B6914] hover:text-[#D4AF37] font-light tracking-wide"
                >
                  Liquidate All ({formatNumber(formatTokenAmount(balance))} Shares)
                </button>
              ) : null}
            </div>

            {redemptionValue && typeof redemptionValue === 'bigint' && redemptionValue > BigInt(0) ? (
              <div className="p-6 bg-gradient-to-br from-[#D4AF37]/10 to-[#8B6914]/5 border-2 border-[#D4AF37]/40 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4A3F35] uppercase tracking-widest font-light">You Will Receive</span>
                  <span className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
                    {formatCurrency(Number(formatUSDC(redemptionValue)))}
                  </span>
                </div>
              </div>
            ) : null}

            <button
              onClick={handleRedeem}
              disabled={loading || !redeemAmount || astAmount === BigInt(0)}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] border-2 border-[#8B6914]/20 text-white hover:from-[#B8941F] hover:to-[#D4AF37] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium tracking-wide rounded-xl text-base shadow-lg"
            >
              <TrendingUp className="w-5 h-5" />
              <span>{loading ? 'Processing...' : 'Complete Liquidation'}</span>
            </button>

            <div className="text-sm text-[#4A3F35] text-center font-light leading-relaxed px-4">
              <p>
                Liquidating will convert your shares to USDC based on the final sale price. This action is irreversible.
              </p>
            </div>
          </div>
        </>
      )}

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

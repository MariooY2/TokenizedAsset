'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useIdentityRegistry } from '../hooks/useIdentityRegistry';
import { formatDate, shortenAddress } from '../lib/utils';
import { Shield, UserPlus, UserMinus, RefreshCw, CheckCircle2, XCircle, AlertCircle, Crown } from 'lucide-react';
import { Modal } from './Modal';

export function KYCManagement() {
  const { address } = useAccount();
  const { useIsVerified, useGetIdentity, addToWhitelist, removeFromWhitelist, renewKYC } =
    useIdentityRegistry();

  const [investorAddress, setInvestorAddress] = useState('');
  const [country, setCountry] = useState('US');
  const [loading, setLoading] = useState(false);
  const [checkAddress, setCheckAddress] = useState('');
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
  const { data: identity } = useGetIdentity(
    (checkAddress as `0x${string}`) || address
  );

  const handleAddToWhitelist = async () => {
    if (!investorAddress) return;

    try {
      setLoading(true);
      const expiryDate = BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60);
      await addToWhitelist(investorAddress as `0x${string}`, expiryDate, country);
      setModalState({
        isOpen: true,
        message: 'Member successfully verified and added to the registry.',
        type: 'success',
        title: 'Verification Complete',
      });
      setInvestorAddress('');
    } catch (error: unknown) {
      setModalState({
        isOpen: true,
        message: error instanceof Error ? error.message : 'Verification failed',
        type: 'error',
        title: 'Verification Failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWhitelist = async () => {
    if (!investorAddress) return;

    try {
      setLoading(true);
      await removeFromWhitelist(investorAddress as `0x${string}`);
      setModalState({
        isOpen: true,
        message: 'Member removed from registry.',
        type: 'success',
        title: 'Member Removed',
      });
      setInvestorAddress('');
    } catch (error: unknown) {
      setModalState({
        isOpen: true,
        message: error instanceof Error ? error.message : 'Removal failed',
        type: 'error',
        title: 'Removal Failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRenewKYC = async () => {
    if (!investorAddress) return;

    try {
      setLoading(true);
      const newExpiry = BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60);
      await renewKYC(investorAddress as `0x${string}`, newExpiry);
      setModalState({
        isOpen: true,
        message: 'Membership renewed successfully.',
        type: 'success',
        title: 'Renewal Complete',
      });
    } catch (error: unknown) {
      setModalState({
        isOpen: true,
        message: error instanceof Error ? error.message : 'Renewal failed',
        type: 'error',
        title: 'Renewal Failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-[#D4AF37]/30 rounded-2xl shadow-2xl p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-[#A8B5A0]/20 rounded-xl blur-sm"></div>
          <div className="relative p-3 bg-linear-to-br from-[#A8B5A0]/20 to-[#8B6914]/10 rounded-xl border border-[#A8B5A0]/40">
            <Crown className="w-7 h-7 text-[#8B6914]" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
            Membership Verification
          </h2>
          <p className="text-sm text-[#8B6914] font-light tracking-wide">Exclusive Access Registry</p>
        </div>
      </div>

      {/* Your Status Card */}
      {address ? (
        <div className={`mb-6 p-6 rounded-xl border-2 ${
          isVerified
            ? 'bg-[#A8B5A0]/10 border-[#A8B5A0]/40'
            : 'bg-[#D4AF37]/10 border-[#D4AF37]/30'
        }`}>
          <div className="flex items-start space-x-4">
            {isVerified ? (
              <CheckCircle2 className="w-7 h-7 text-[#4A3F35] mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-7 h-7 text-[#8B6914] mt-0.5 shrink-0" />
            )}
            <div>
              <h3 className={`font-bold text-xl mb-2 ${isVerified ? 'text-[#4A3F35]' : 'text-[#8B6914]'}`} style={{fontFamily: "'Playfair Display', serif"}}>
                {isVerified ? 'Verified Member' : 'Verification Pending'}
              </h3>
              <p className="text-sm text-[#4A3F35] font-light leading-relaxed">
                {isVerified
                  ? 'Your membership is active. You may participate in exclusive offerings and governance decisions.'
                  : 'Complete the verification process to gain access to exclusive art investment opportunities.'
                }
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Check Verification Status */}
      <div className="mb-6 p-6 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
        <h3 className="font-bold text-[#2C2416] mb-4 flex items-center space-x-2" style={{fontFamily: "'Playfair Display', serif"}}>
          <Shield className="w-5 h-5 text-[#8B6914]" />
          <span>Verify Membership Status</span>
        </h3>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter wallet address (leave empty for your address)"
            value={checkAddress}
            onChange={(e) => setCheckAddress(e.target.value)}
            className="w-full px-5 py-3 bg-white border-2 border-[#E8DCC4] text-[#2C2416] placeholder-[#8B6914]/40 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-all"
          />

          {identity && typeof identity === 'object' && 'isVerified' in identity ? (
            <div className="p-5 bg-white border border-[#E8DCC4] rounded-xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8DCC4]">
                <span className="text-[#8B6914] text-sm uppercase tracking-widest font-light">Status</span>
                <div className="flex items-center space-x-2">
                  {(identity as any).isVerified ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#A8B5A0]" />
                      <span className="font-medium text-[#4A3F35]">Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-[#8B6914]" />
                      <span className="font-medium text-[#8B6914]">Unverified</span>
                    </>
                  )}
                </div>
              </div>

              {(identity as any).isVerified ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B6914] text-sm uppercase tracking-widest font-light">Jurisdiction</span>
                    <span className="font-medium text-[#2C2416]">{(identity as any).country}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B6914] text-sm uppercase tracking-widest font-light">Verified On</span>
                    <span className="font-medium text-[#2C2416] text-sm">
                      {formatDate((identity as any).approvedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B6914] text-sm uppercase tracking-widest font-light">Valid Until</span>
                    <span className="font-medium text-[#2C2416] text-sm">
                      {formatDate((identity as any).expiryDate)}
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Admin Actions */}
      <div className="space-y-5">
        <h3 className="font-bold text-[#2C2416] flex items-center space-x-2" style={{fontFamily: "'Playfair Display', serif"}}>
          <UserPlus className="w-5 h-5 text-[#8B6914]" />
          <span>Administrative Actions</span>
        </h3>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Member Wallet Address (0x...)"
            value={investorAddress}
            onChange={(e) => setInvestorAddress(e.target.value)}
            className="w-full px-5 py-3 bg-white border-2 border-[#E8DCC4] text-[#2C2416] placeholder-[#8B6914]/40 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-all"
          />

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-5 py-3 bg-white border-2 border-[#E8DCC4] text-[#2C2416] rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-all"
          >
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="CH">Switzerland</option>
            <option value="SG">Singapore</option>
            <option value="OTHER">Other</option>
          </select>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={handleAddToWhitelist}
              disabled={loading || !investorAddress}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#A8B5A0]/20 border-2 border-[#A8B5A0]/40 text-[#4A3F35] rounded-xl hover:bg-[#A8B5A0]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-light tracking-wide"
            >
              <UserPlus className="w-4 h-4" />
              <span>Verify Member</span>
            </button>

            <button
              onClick={handleRenewKYC}
              disabled={loading || !investorAddress}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#D4AF37]/20 border-2 border-[#D4AF37]/40 text-[#8B6914] rounded-xl hover:bg-[#D4AF37]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-light tracking-wide"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Renew</span>
            </button>

            <button
              onClick={handleRemoveFromWhitelist}
              disabled={loading || !investorAddress}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#4A3F35]/10 border-2 border-[#4A3F35]/30 text-[#4A3F35] rounded-xl hover:bg-[#4A3F35]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-light tracking-wide"
            >
              <UserMinus className="w-4 h-4" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl">
          <p className="text-center text-sm text-[#8B6914] flex items-center justify-center space-x-2 font-light">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Processing transaction...</span>
          </p>
        </div>
      ) : null}

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

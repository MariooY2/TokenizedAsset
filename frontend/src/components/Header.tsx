'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useIdentityRegistry } from '@/src/hooks/useIdentityRegistry';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Wallet, TrendingDown, Vote, Shield, Sparkles } from 'lucide-react';

export function Header() {
  const { address, isConnected } = useAccount();
  const { useIsVerified } = useIdentityRegistry();
  const { data: isVerified } = useIsVerified(address);
  const pathname = usePathname();

  const navigation = [
    { name: 'Gallery', href: '/', icon: Home },
    { name: 'Acquire', href: '/buy', icon: ShoppingCart },
    { name: 'Portfolio', href: '/dashboard', icon: Wallet },
    { name: 'Liquidate', href: '/redeem', icon: TrendingDown },
    { name: 'Governance', href: '/governance', icon: Vote },
    { name: 'Verification', href: '/kyc', icon: Shield },
  ];

  return (
    <header className="border-b border-[#D4AF37]/20 bg-[#FAF8F3]/95 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-lg blur-sm group-hover:blur-md transition-all"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-[#D4AF37]/10 to-[#8B6914]/10 rounded-lg border border-[#D4AF37]/30">
                <Sparkles className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2C2416] tracking-tight" style={{fontFamily: "'Playfair Display', serif"}}>
                Maison d&apos;Art
              </h1>
              <p className="text-xs text-[#8B6914] font-light tracking-wider hidden md:block uppercase">
                Fillette au béret
              </p>
            </div>
          </Link>

          {isConnected ? (
            <nav className="hidden lg:flex items-center space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all font-light ${
                      isActive
                        ? 'bg-[#D4AF37]/15 text-[#8B6914] border border-[#D4AF37]/40 shadow-sm'
                        : 'text-[#4A3F35] hover:text-[#2C2416] hover:bg-[#E8DCC4]/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm tracking-wide">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          ) : null}

          <div className="flex items-center space-x-3">
            {address && (
              <div
                className={`px-3 py-2 rounded-lg text-xs font-light tracking-wide border ${
                  isVerified
                    ? 'bg-[#A8B5A0]/20 text-[#4A3F35] border-[#A8B5A0]/40'
                    : 'bg-[#D4AF37]/10 text-[#8B6914] border-[#D4AF37]/30'
                }`}
              >
                {isVerified ? '✓ Verified Member' : '⋄ Awaiting Verification'}
              </div>
            )}
            <ConnectButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        {isConnected ? (
          <nav className="lg:hidden mt-4 grid grid-cols-3 gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center space-y-1 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#D4AF37]/15 text-[#8B6914] border border-[#D4AF37]/40'
                      : 'text-[#4A3F35] hover:text-[#2C2416] hover:bg-[#E8DCC4]/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-light tracking-wide">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </header>
  );
}

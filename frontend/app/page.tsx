'use client';

import { useAccount } from 'wagmi';
import { Sparkles, ShoppingCart, Wallet, TrendingUp, Vote, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isConnected } = useAccount();

  const features = [
    {
      icon: ShoppingCart,
      title: 'Acquire Shares',
      description: 'Purchase fractional ownership through our exclusive offering',
      href: '/buy',
    },
    {
      icon: Wallet,
      title: 'Portfolio',
      description: 'Monitor your holdings and ownership stake',
      href: '/dashboard',
    },
    {
      icon: TrendingUp,
      title: 'Liquidation',
      description: 'Convert shares to proceeds upon asset sale',
      href: '/redeem',
    },
    {
      icon: Vote,
      title: 'Governance',
      description: 'Participate in member voting and key decisions',
      href: '/governance',
    },
  ];

  const stats = [
    { label: 'Artwork Valuation', value: '$4,000,000' },
    { label: 'Total Shares', value: '2,000' },
    { label: 'Share Price', value: '$2,000' },
  ];

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-3xl blur-xl"></div>
                <div className="relative p-10 bg-linear-to-br from-[#D4AF37]/10 to-[#8B6914]/5 rounded-3xl backdrop-blur-sm border-2 border-[#D4AF37]/30 shadow-2xl">
                  <Sparkles className="w-20 h-20 text-[#D4AF37]" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
              Own a Piece of Art History
            </h1>

            <div className="h-1 w-32 mx-auto mb-8 bg-linear-to-r from-transparent via-[#D4AF37] to-transparent"></div>

            <p className="text-2xl md:text-3xl text-[#8B6914] mb-6 font-light tracking-wide" style={{fontFamily: "'Cormorant Garamond', serif"}}>
              Picasso's "Fillette au béret"
            </p>

            <p className="text-lg text-[#4A3F35] max-w-2xl mx-auto mb-12 font-light leading-relaxed">
              Exclusive fractional ownership of a $4 million masterpiece. Invest in museum-quality fine art with comprehensive regulatory compliance and blockchain security.
            </p>

            <div className="inline-flex items-center space-x-3 px-8 py-4 bg-[#D4AF37]/10 border-2 border-[#D4AF37]/40 rounded-xl text-[#8B6914] shadow-lg">
              <Shield className="w-6 h-6" />
              <span className="font-light tracking-wide">Connect your wallet to begin</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-8 bg-white/60 backdrop-blur-sm border border-[#E8DCC4] rounded-2xl shadow-xl hover:border-[#D4AF37]/40 transition-all"
              >
                <div className="text-4xl font-bold text-[#2C2416] mb-3" style={{fontFamily: "'Playfair Display', serif"}}>
                  {stat.value}
                </div>
                <div className="text-sm text-[#8B6914] uppercase tracking-widest font-light">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="p-10 bg-white/60 backdrop-blur-sm border border-[#E8DCC4] rounded-2xl shadow-2xl">
            <h2 className="text-3xl font-bold text-[#2C2416] mb-8 text-center" style={{fontFamily: "'Playfair Display', serif"}}>
              Membership Process
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#D4AF37]/20 border-2 border-[#D4AF37]/40 rounded-full flex items-center justify-center text-[#8B6914] font-bold">
                  1
                </div>
                <div>
                  <div className="font-bold text-[#2C2416] mb-2" style={{fontFamily: "'Playfair Display', serif"}}>
                    Connect Wallet
                  </div>
                  <div className="text-sm text-[#4A3F35] font-light leading-relaxed">
                    Securely connect your Web3 wallet using MetaMask or compatible providers
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#D4AF37]/20 border-2 border-[#D4AF37]/40 rounded-full flex items-center justify-center text-[#8B6914] font-bold">
                  2
                </div>
                <div>
                  <div className="font-bold text-[#2C2416] mb-2" style={{fontFamily: "'Playfair Display', serif"}}>
                    Complete Verification
                  </div>
                  <div className="text-sm text-[#4A3F35] font-light leading-relaxed">
                    Submit to our compliance process to satisfy regulatory requirements
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#D4AF37]/20 border-2 border-[#D4AF37]/40 rounded-full flex items-center justify-center text-[#8B6914] font-bold">
                  3
                </div>
                <div>
                  <div className="font-bold text-[#2C2416] mb-2" style={{fontFamily: "'Playfair Display', serif"}}>
                    Acquire Shares
                  </div>
                  <div className="text-sm text-[#4A3F35] font-light leading-relaxed">
                    Purchase fractional ownership using USDC stablecoins
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#D4AF37]/20 border-2 border-[#D4AF37]/40 rounded-full flex items-center justify-center text-[#8B6914] font-bold">
                  4
                </div>
                <div>
                  <div className="font-bold text-[#2C2416] mb-2" style={{fontFamily: "'Playfair Display', serif"}}>
                    Own & Govern
                  </div>
                  <div className="text-sm text-[#4A3F35] font-light leading-relaxed">
                    Hold shares and exercise voting rights on governance matters
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
            Welcome to Your Collection
          </h1>
          <div className="h-px w-32 mx-auto mb-6 bg-linear-to-r from-transparent via-[#D4AF37] to-transparent"></div>
          <p className="text-[#4A3F35] font-light tracking-wide">
            Manage your fractional ownership of Picasso's "Fillette au béret"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group p-8 bg-white/60 backdrop-blur-sm border border-[#E8DCC4] rounded-2xl shadow-xl hover:border-[#D4AF37]/40 hover:shadow-2xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl">
                    <Icon className="w-7 h-7 text-[#D4AF37]" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#8B6914]/40 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-2xl font-bold text-[#2C2416] mb-3" style={{fontFamily: "'Playfair Display', serif"}}>
                  {feature.title}
                </h3>
                <p className="text-[#4A3F35] text-sm font-light leading-relaxed">{feature.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="p-8 bg-white/60 backdrop-blur-sm border border-[#E8DCC4] rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-[#2C2416] mb-6" style={{fontFamily: "'Playfair Display', serif"}}>
            Investment Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {stats.map((stat) => (
              <div key={stat.label} className="p-5 bg-[#FAF8F3] border border-[#E8DCC4] rounded-xl">
                <div className="text-xs text-[#8B6914] mb-2 uppercase tracking-widest font-light">{stat.label}</div>
                <div className="text-3xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

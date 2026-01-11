import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/src/lib/providers";
import { Header } from "@/src/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maison d'Art - Luxury Art Tokenization",
  description: "Exclusive fractional ownership of Picasso's Fillette au béret - A $4M masterpiece",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-[#D4AF37]/20 bg-[#FAF8F3]/80 backdrop-blur-sm mt-16">
              <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                  <div className="mb-4">
                    <h3 className="text-2xl font-serif text-[#2C2416] mb-1" style={{fontFamily: "'Playfair Display', serif"}}>
                      Maison d'Art
                    </h3>
                    <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
                  </div>
                  <p className="text-sm text-[#4A3F35] mb-2 font-light tracking-wide">
                    Exclusive Fractional Ownership of Fine Art Masterpieces
                  </p>
                  <p className="text-xs text-[#8B6914] uppercase tracking-widest">
                    Powered by Blockchain Technology
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}

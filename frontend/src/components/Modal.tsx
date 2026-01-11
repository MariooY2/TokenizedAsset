'use client';

import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export function Modal({ isOpen, onClose, title, message, type = 'info' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-[#A8B5A0]" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-[#D4AF37]" />;
      default:
        return <Info className="w-6 h-6 text-[#8B6914]" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-[#A8B5A0]/10 border-[#A8B5A0]/40';
      case 'error':
        return 'bg-[#D4AF37]/10 border-[#D4AF37]/40';
      default:
        return 'bg-[#FAF8F3] border-[#E8DCC4]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2C2416]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-[#D4AF37]/30 max-w-md w-full animate-in fade-in zoom-in duration-200">
        <div className={`p-6 border-b border-[#E8DCC4] ${getColors()}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <h3 className="text-xl font-bold text-[#2C2416]" style={{fontFamily: "'Playfair Display', serif"}}>
                {title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice')}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-[#8B6914] hover:text-[#2C2416] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-[#4A3F35] font-light leading-relaxed">
            {message}
          </p>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white rounded-xl hover:from-[#B8941F] hover:to-[#D4AF37] transition-all font-medium tracking-wide shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

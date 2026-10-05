import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTelegramUrl, getLineUrl } from '../data/initialData';
import { Phone, MessageSquare, Send, MessageCircle, Mail, X } from 'lucide-react';

export const FloatingContact: React.FC = () => {
  const { settings, openConsultModal, currentRoute } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // Do not overlay floating contact over Admin dashboard
  if (currentRoute === 'admin') {
    return null;
  }

  return (
    <aside aria-label="Floating quick contact" className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-2.5">
      {/* Expanded quick contact actions — Priority: 1. Messenger, 2. Phone, 3. LINE, 4. Telegram, 5. Email */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2 mb-1 animate-in slide-in-from-bottom-3 duration-200">
          {/* 1. Messenger (Primary) */}
          <a
            href={settings.messengerUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
            title="Chat on Messenger"
          >
            <span>Messenger</span>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-white" />
            </div>
          </a>

          {/* 2. Phone call (Secondary) */}
          <a
            href={`tel:${settings.phone}`}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-lg hover:bg-slate-800 transition-all hover:scale-105"
            title="Call Now"
          >
            <span>Call {settings.phone}</span>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Phone className="w-3.5 h-3.5 text-white" />
            </div>
          </a>

          {/* 3. LINE (Third) */}
          <a
            href={getLineUrl(settings)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#06C755] text-white text-xs font-semibold shadow-lg hover:bg-[#05b34c] transition-all hover:scale-105"
            title="Chat on LINE"
          >
            <span>LINE: {settings.lineId}</span>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-3.5 h-3.5 text-white" />
            </div>
          </a>

          {/* 4. Telegram (Fourth) */}
          <a
            href={getTelegramUrl(settings)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#229ED9] text-white text-xs font-semibold shadow-lg hover:bg-[#1e8cc2] transition-all hover:scale-105"
            title="Chat on Telegram"
          >
            <span>Telegram</span>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Send className="w-3.5 h-3.5 text-white" />
            </div>
          </a>

          {/* 5. Email (Fifth) */}
          <a
            href={`mailto:${settings.email}`}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-sky-700 text-white text-xs font-semibold shadow-lg hover:bg-sky-800 transition-all hover:scale-105"
            title="Send Email"
          >
            <span>Email</span>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Mail className="w-3.5 h-3.5 text-white" />
            </div>
          </a>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle contact channels"
        className={`flex items-center gap-2 px-4 py-3 rounded-full text-white font-semibold text-sm shadow-xl transition-all active:scale-95 ${
          isOpen
            ? 'bg-slate-800 hover:bg-slate-900'
            : 'bg-sky-600 hover:bg-sky-700 ring-4 ring-sky-200/50'
        }`}
      >
        {isOpen ? (
          <>
            <X className="w-5 h-5" />
            <span className="text-xs">ပိတ်မည်</span>
          </>
        ) : (
          <>
            <MessageCircle className="w-5 h-5 animate-pulse" />
            <span className="font-burmese text-xs hidden sm:inline">တိုင်ပင်ရန်</span>
          </>
        )}
      </button>
    </aside>
  );
};

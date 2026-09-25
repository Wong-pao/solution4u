import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, MessageSquare, Send, MessageCircle, X } from 'lucide-react';

export const FloatingContact: React.FC = () => {
  const { settings, openConsultModal } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside aria-label="Floating quick contact" className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-2.5">
      {/* Expanded quick contact actions */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2 mb-1 animate-in slide-in-from-bottom-3 duration-200">
          {/* WhatsApp */}
          <a
            href={settings.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-lg hover:bg-emerald-700 transition-all hover:scale-105"
            title="Chat on WhatsApp"
          >
            <span>WhatsApp</span>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-white" />
            </div>
          </a>

          {/* Messenger */}
          <a
            href={settings.messengerUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
            title="Chat on Messenger"
          >
            <span>Messenger</span>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Send className="w-3.5 h-3.5 text-white" />
            </div>
          </a>

          {/* LINE */}
          <a
            href={settings.lineUrl}
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

          {/* Phone call */}
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
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-3 rounded-full text-white font-semibold text-sm shadow-xl transition-all active:scale-95 ${
          isOpen
            ? 'bg-slate-800 hover:bg-slate-900'
            : 'bg-sky-600 hover:bg-sky-700 ring-4 ring-sky-200/50'
        }`}
        aria-label="Toggle contact channels"
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

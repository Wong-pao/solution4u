import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTelegramUrl, getLineUrl } from '../data/initialData';
import { X, MessageSquare, Send, Phone, CheckCircle2, HeartHandshake, AlertCircle } from 'lucide-react';

export const QuickConsultModal: React.FC = () => {
  const { isConsultModalOpen, closeConsultModal, consultServicePreselect, services, settings, submitInquiry } = useApp();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [contactChannel, setContactChannel] = useState<'messenger' | 'phone' | 'line' | 'telegram' | 'email'>('messenger');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (consultServicePreselect) {
      setSelectedService(consultServicePreselect);
    } else if (services.length > 0 && !selectedService) {
      setSelectedService(services[0].title);
    }
  }, [consultServicePreselect, services, selectedService]);

  const resetAndClose = () => {
    setIsSubmitted(false);
    setSubmitError(null);
    setFullName('');
    setPhoneNumber('');
    setMessage('');
    setHoneypot('');
    closeConsultModal();
  };

  // Lock body scroll and listen for Escape key when modal is open
  useEffect(() => {
    if (!isConsultModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetAndClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isConsultModalOpen]);

  if (!isConsultModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || isSubmitting) return;

    // 1. Honeypot check: if filled by bot, silently return success without database insert
    if (honeypot.trim()) {
      setIsSubmitted(true);
      return;
    }

    // 2. Client-side rate-limit: 15 seconds throttle
    const now = Date.now();
    const lastSubmit = parseInt(localStorage.getItem('s4u_last_inquiry_ts') || '0', 10);
    if (now - lastSubmit < 15000) {
      setSubmitError('မကြာသေးမီက စာပို့ထားပြီးဖြစ်ပါသည်။ ခေတ္တစောင့်ဆိုင်းပြီးမှ ထပ်မံပေးပို့ပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။');
      return;
    }

    // 3. Basic phone number sanity check
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 7) {
      setSubmitError('ကျေးဇူးပြု၍ မှန်ကန်သော ဖုန်းနံပါတ် ရိုက်ထည့်ပေးပါ');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitInquiry({
        fullName: fullName.trim() || 'မိတ်ဆွေ',
        phoneNumber: phoneNumber.trim(),
        contactChannel,
        serviceType: selectedService || 'အထွေထွေ အကြံပေးမှု',
        message: message.trim(),
      });
      localStorage.setItem('s4u_last_inquiry_ts', Date.now().toString());
      setIsSubmitted(true);
    } catch (err: any) {
      console.warn('[QuickConsultModal] submitInquiry notice:', err);
      setSubmitError('အချက်အလက် ပေးပို့ရာတွင် အဆင်မပြေဖြစ်သွားပါသည်- ကျေးဇူးပြု၍ Messenger သို့မဟုတ် ဖုန်းဖြင့် တိုက်ရိုက်ဆက်သွယ်ပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။');
    } finally {
      setIsSubmitting(false);
    }
  };

  const telegramUrl = getTelegramUrl(settings);
  const lineUrl = getLineUrl(settings);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-consult-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-7 shadow-2xl relative border border-slate-100">
        {/* Close button */}
        <button
          type="button"
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-4 font-burmese">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              တိုင်ပင်ဆွေးနွေးရန် အချက်အလက်များ လက်ခံရရှိပါပြီ။
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              မိတ်ဆွေ၏ လိုအပ်ချက်အတွက် Solution for You အဖွဲ့သားများမှ ရွေးချယ်ထားသော {contactChannel.toUpperCase()} သို့ အမြန်ဆုံး ဆက်သွယ်အကြံပြုပေးပါမည်။
            </p>
            <div className="pt-3">
              <button
                onClick={resetAndClose}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800"
              >
                ကျေးဇူးတင်ပါသည် (ပိတ်မည်)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 id="quick-consult-title" className="text-lg font-bold text-slate-900 font-burmese">အခမဲ့ တိုင်ပင်ဆွေးနွေးရန်</h3>
                <p className="text-xs text-slate-500 font-burmese">စိတ်ချစွာ ရင်းနှီးပွင့်လင်းစွာ မေးမြန်းနိုင်ပါတယ်</p>
              </div>
            </div>

            {/* Instant 1-click messaging shortcuts — Priority: 1. Messenger, 2. Phone, 3. LINE, 4. Telegram */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <p className="text-xs font-semibold text-slate-700 font-burmese">တိုက်ရိုက် အမြန်စကားပြောလိုပါက -</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a
                  href={settings.messengerUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={resetAndClose}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Messenger</span>
                </a>
                <a
                  href={`tel:${settings.phone}`}
                  onClick={resetAndClose}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>ဖုန်းခေါ်ဆိုရန်</span>
                </a>
                <a
                  href={lineUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={resetAndClose}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-medium transition-colors"
                >
                  <span>LINE ID</span>
                </a>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={resetAndClose}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#229ED9] hover:bg-[#1e8cc2] text-white text-xs font-medium transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>

            {/* Quick form for callback */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-sm font-burmese">
              {/* Anti-spam honeypot (invisible to humans) */}
              <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                <label htmlFor="qc_company_website_hp">Leave blank</label>
                <input
                  id="qc_company_website_hp"
                  type="text"
                  name="qc_company_website_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="leading-relaxed">{submitError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  မိတ်ဆွေ၏ အမည် (သို့မဟုတ် ခေါ်ဆိုရမည့်အမည်)
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ဥပမာ - မောင်မောင်"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ဆက်သွယ်ရန် ဖုန်းနံပါတ် <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={40}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="08x-xxx-xxxx"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    မေးမြန်းလိုသော ကိစ္စရပ်
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-sm bg-white"
                  >
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.title}>
                        {svc.title}
                      </option>
                    ))}
                    <option value="အခြား အထွေထွေ">အခြား အထွေထွေ အကူအညီ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ပြန်လည်ဆက်သွယ်စေလိုသည့် လမ်းကြောင်း
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {[
                    { id: 'messenger', label: 'Messenger' },
                    { id: 'phone', label: 'ဖုန်းခေါ်' },
                    { id: 'line', label: 'LINE' },
                    { id: 'telegram', label: 'Telegram' },
                    { id: 'email', label: 'Email' },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setContactChannel(ch.id as any)}
                      className={`py-1.5 px-2 rounded-md border text-center transition-colors ${
                        contactChannel === ch.id
                          ? 'border-sky-600 bg-sky-50 text-sky-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  သိရှိလိုသည်များကို အကျဉ်းချုပ် ရေးသားပေးပါ (ရွေးချယ်ရန်)
                </label>
                <textarea
                  rows={2}
                  maxLength={2000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="ဥပမာ - ဘဏ်အကောင့်ဖွင့်ချင်လို့ ဘာတွေလိုမလဲ သိချင်ပါတယ်"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition-colors shadow-xs active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? 'ပေးပို့နေပါသည်...' : 'အခမဲ့ တိုင်ပင်ရန် ပေးပို့မည်'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

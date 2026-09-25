import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, MessageSquare, Send, Phone, CheckCircle2, HeartHandshake } from 'lucide-react';

export const QuickConsultModal: React.FC = () => {
  const { isConsultModalOpen, closeConsultModal, consultServicePreselect, services, settings, submitInquiry } = useApp();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [contactChannel, setContactChannel] = useState<'whatsapp' | 'line' | 'messenger' | 'phone'>('whatsapp');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (consultServicePreselect) {
      setSelectedService(consultServicePreselect);
    } else if (services.length > 0 && !selectedService) {
      setSelectedService(services[0].title);
    }
  }, [consultServicePreselect, services]);

  if (!isConsultModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setIsSubmitting(true);
    try {
      await submitInquiry({
        fullName: fullName.trim() || 'မိတ်ဆွေ',
        phoneNumber: phoneNumber.trim(),
        contactChannel,
        serviceType: selectedService || 'အထွေထွေ အကြံပေးမှု',
        message: message.trim(),
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectChat = (channel: 'whatsapp' | 'messenger' | 'line') => {
    const text = encodeURIComponent(
      `မင်္ဂလာပါ Solution for You။ ကျွန်တော်/ကျွန်မ ${selectedService || 'ဝန်ဆောင်မှု'} နှင့် ပတ်သက်ပြီး အခမဲ့ ဆွေးနွေးတိုင်ပင်လိုပါသည် ခင်ဗျာ။`
    );

    if (channel === 'whatsapp') {
      window.open(`${settings.whatsappUrl}?text=${text}`, '_blank');
    } else if (channel === 'messenger') {
      window.open(settings.messengerUrl, '_blank');
    } else if (channel === 'line') {
      window.open(settings.lineUrl, '_blank');
    }
    closeConsultModal();
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setFullName('');
    setPhoneNumber('');
    setMessage('');
    closeConsultModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-slate-100 overflow-hidden">
        {/* Close button */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
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
                <h3 className="text-lg font-bold text-slate-900 font-burmese">အခမဲ့ တိုင်ပင်ဆွေးနွေးရန်</h3>
                <p className="text-xs text-slate-500 font-burmese">စိတ်ချစွာ ရင်းနှီးပွင့်လင်းစွာ မေးမြန်းနိုင်ပါတယ်</p>
              </div>
            </div>

            {/* Instant 1-click messaging shortcuts */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <p className="text-xs font-semibold text-slate-700 font-burmese">တိုက်ရိုက် အမြန်စကားပြောလိုပါက -</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectChat('whatsapp')}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectChat('messenger')}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Messenger</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectChat('line')}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-medium transition-colors"
                >
                  <span>LINE ID</span>
                </button>
              </div>
            </div>

            {/* Quick form for callback */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-sm font-burmese">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  မိတ်ဆွေ၏ အမည် (သို့မဟုတ် ခေါ်ဆိုရမည့်အမည်)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ဥပမာ - မောင်မောင်"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ဖုန်းနံပါတ် / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
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
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'whatsapp', label: 'WhatsApp' },
                    { id: 'messenger', label: 'Messenger' },
                    { id: 'line', label: 'LINE' },
                    { id: 'phone', label: 'ဖုန်းခေါ်' },
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

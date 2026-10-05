import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTelegramUrl, getLineUrl } from '../data/initialData';
import {
  Phone,
  MessageSquare,
  Send,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  HeartHandshake,
  AlertCircle,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, services, submitInquiry, contactContent } = useApp();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [channel, setChannel] = useState<'messenger' | 'phone' | 'line' | 'telegram' | 'email'>('messenger');
  const [serviceChoice, setServiceChoice] = useState(services[0]?.title || 'ဗီဇာ/စာရွက်စာတမ်း');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || loading) return;

    // 1. Honeypot check: if filled by bot, silently return success without database insert
    if (honeypot.trim()) {
      setSubmitted(true);
      return;
    }

    // 2. Client-side rate-limit: 15 seconds throttle
    const now = Date.now();
    const lastSubmit = parseInt(localStorage.getItem('s4u_last_inquiry_ts') || '0', 10);
    if (now - lastSubmit < 15000) {
      setContactError(
        contactContent?.rateLimitMessage ||
          'မကြာသေးမီက စာပို့ထားပြီးဖြစ်ပါသည်။ ခေတ္တစောင့်ဆိုင်းပြီးမှ ထပ်မံပေးပို့ပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။'
      );
      return;
    }

    // 3. Basic phone number sanity check
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 7) {
      setContactError(
        (contactContent?.invalidPhoneMessage &&
        !contactContent.invalidPhoneMessage.includes('WhatsApp')
          ? contactContent.invalidPhoneMessage
          : 'ကျေးဇူးပြု၍ မှန်ကန်သော ဖုန်းနံပါတ် ရိုက်ထည့်ပေးပါ')
      );
      return;
    }

    setLoading(true);
    setContactError(null);
    try {
      await submitInquiry({
        fullName: fullName.trim() || 'မိတ်ဆွေ',
        phoneNumber: phoneNumber.trim(),
        contactChannel: channel,
        serviceType: serviceChoice,
        message: message.trim(),
      });
      localStorage.setItem('s4u_last_inquiry_ts', Date.now().toString());
      setSubmitted(true);
    } catch (err: any) {
      console.warn('[ContactPage] submitInquiry notice:', err);
      setContactError(
        (contactContent?.errorMessage && !contactContent.errorMessage.includes('WhatsApp')
          ? contactContent.errorMessage
          : 'မက်ဆေ့ခ်ျ ပေးပို့ရာတွင် အဆင်မပြေဖြစ်သွားပါသည်- ကျေးဇူးပြု၍ အထက်ပါ Messenger၊ ဖုန်းနံပါတ် သို့မဟုတ် LINE ဖြင့် တိုက်ရိုက်ဆက်သွယ်ပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။')
      );
    } finally {
      setLoading(false);
    }
  };

  const telegramUrl = getTelegramUrl(settings);
  const lineUrl = getLineUrl(settings);
  const telegramCardTitle =
    contactContent?.telegramButtonTitle ||
    (contactContent?.whatsappButtonTitle && contactContent.whatsappButtonTitle !== 'WhatsApp'
      ? contactContent.whatsappButtonTitle
      : 'Telegram');
  const telegramCardSubtext =
    contactContent?.telegramButtonSubtext ||
    contactContent?.whatsappButtonSubtext ||
    settings.telegramUsername ||
    'တိုက်ရိုက် စာပို့ရန်';
  const normalizedPhoneLabel =
    contactContent?.formPhoneLabel &&
    contactContent.formPhoneLabel !== 'ဖုန်းနံပါတ် / WhatsApp' &&
    contactContent.formPhoneLabel !== 'ဖုန်းနံပါတ် / Telegram'
      ? contactContent.formPhoneLabel
      : 'ဆက်သွယ်ရန် ဖုန်းနံပါတ်';

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-b from-sky-50/60 to-white pt-12 pb-14 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold font-burmese">
            <HeartHandshake className="w-4 h-4" />
            <span>{contactContent?.headerBadge || 'ဘန်ကောက်ရှိ မိတ်ဆွေတစ်ယောက်'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-burmese leading-snug">
            {contactContent?.headerTitle ||
              'လူကြီးမင်းတို့၏ စိတ်ကျေနပ်မှုနှင့် စိတ်အေးချမ်းမှုသည် ကျွန်ုပ်တို့၏ အဓိက ပန်းတိုင်ဖြစ်ပါသည်။'}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-burmese max-w-2xl mx-auto leading-relaxed">
            {contactContent?.headerSubtitle ||
              "ဘန်ကောက်တွင် နေထိုင်အလုပ်လုပ်ကိုင်နေကြတဲ့ အကို၊အမတို့၏ ဗီဇာ၊ စာရွက်စာတမ်းနှင့် နေထိုင်ရေးဆိုင်ရာ ကိစ္စရပ်များအတွက် 'Solution for You' ထံ စိတ်အေးချမ်းစွာ တိုင်ပင်ဆွေးနွေးနိုင်ပါတယ်။"}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Prominent Contact Buttons Row — Priority: 1. Messenger, 2. Phone, 3. LINE, 4. Telegram, 5. Email */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 font-burmese">
          {/* 1. Messenger (Primary) */}
          <a
            href={settings.messengerUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:-translate-y-0.5"
          >
            <MessageSquare className="w-6 h-6 mb-2" />
            <span className="text-sm font-bold">{contactContent?.messengerButtonTitle || 'Messenger'}</span>
            <span className="text-[11px] opacity-80 mt-0.5">
              {contactContent?.messengerButtonSubtext || 'Facebook Chat'}
            </span>
          </a>

          {/* 2. Phone (Secondary) */}
          <a
            href={`tel:${settings.phone}`}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all hover:-translate-y-0.5"
          >
            <Phone className="w-6 h-6 mb-2 text-sky-400" />
            <span className="text-sm font-bold">{contactContent?.phoneButtonTitle || 'Call Now'}</span>
            <span className="text-[11px] text-slate-300 mt-0.5">{settings.phone}</span>
          </a>

          {/* 3. LINE (Third) */}
          <a
            href={lineUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white shadow-sm transition-all hover:-translate-y-0.5"
          >
            <span className="w-6 h-6 flex items-center justify-center font-bold text-lg mb-2">L</span>
            <span className="text-sm font-bold">{contactContent?.lineButtonTitle || 'LINE ID'}</span>
            <span className="text-[11px] opacity-90 mt-0.5">{settings.lineId}</span>
          </a>

          {/* 4. Telegram (Fourth) */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#229ED9] hover:bg-[#1e8cc2] text-white shadow-sm transition-all hover:-translate-y-0.5"
          >
            <Send className="w-6 h-6 mb-2" />
            <span className="text-sm font-bold">{telegramCardTitle}</span>
            <span className="text-[11px] opacity-90 mt-0.5">
              {telegramCardSubtext}
            </span>
          </a>

          {/* 5. Email (Fifth) */}
          <a
            href={`mailto:${settings.email}`}
            className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-5 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white shadow-sm transition-all hover:-translate-y-0.5"
          >
            <Mail className="w-6 h-6 mb-2" />
            <span className="text-sm font-bold">{contactContent?.emailButtonTitle || 'Email'}</span>
            <span className="text-[11px] opacity-80 mt-0.5 truncate max-w-full px-2">
              {contactContent?.emailButtonSubtext || 'အီးမေးလ် ပို့ရန်'}
            </span>
          </a>
        </div>

        {/* Content Columns: Info & Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Office Address & Hours */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900 font-burmese">
                {contactContent?.infoSectionTitle || 'ရုံးတည်နေရာနှင့် ဆက်သွယ်ရန်'}
              </h2>

              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      {contactContent?.addressLabel || 'Office Address'}
                    </h3>
                    <p className="text-slate-900 font-medium mt-1 leading-relaxed">
                      {contactContent?.addressText ||
                        settings.address ||
                        'Soi Lat Phrao 107, Khlong Chan, Bang Kapi, Bangkok 10240, Thailand.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      {contactContent?.phoneLabel || 'Phone Number'}
                    </h3>
                    <a href={`tel:${settings.phone}`} className="text-slate-900 font-bold hover:text-sky-600 transition-colors">
                      {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      {contactContent?.emailLabel || 'Email Address'}
                    </h3>
                    <a href={`mailto:${settings.email}`} className="text-slate-900 font-medium hover:text-sky-600 transition-colors break-all">
                      {settings.email}
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-xs font-burmese">
                    <h3 className="font-semibold text-slate-900">
                      {contactContent?.hoursHeading || 'ရုံးဖွင့်ချိန် (Business Hours)'}
                    </h3>
                    <p className="text-slate-700 font-medium">
                      {contactContent?.hoursWeekday || 'Monday – Friday: 9:00 AM – 5:00 PM'}
                    </p>
                    <p className="text-slate-500 leading-relaxed">
                      {contactContent?.hoursWeekendClosed || 'Saturday & Sunday: Office closed.'}
                      <br />
                      {contactContent?.hoursWeekendNote ||
                        'သို့သော် မိတ်ဆွေများအနေဖြင့် Messenger သို့မဟုတ် LINE တွင် မက်ဆေ့ခ်ျ ချန်ထားခဲ့နိုင်ပါသည်။'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Location Reference */}
            <div className="bg-slate-100 rounded-3xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2 font-burmese">
              <p className="font-semibold text-slate-800">
                {contactContent?.locationGuideHeading || 'Bangkok လမ်းညွှန်ချက် -'}
              </p>
              <p>
                {contactContent?.locationGuideText ||
                  'Lat Phrao 107 အနီးဝန်းကျင်တွင် တည်ရှိပြီး၊ လူကိုယ်တိုင် လာရောက်လိုပါက အဆင်ပြေစေရန် ဖုန်း သို့မဟုတ် LINE ဖြင့် ကြိုတင်ရက်ချိန်း ရယူပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။'}
              </p>
            </div>
          </div>

          {/* Right: Interactive Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 font-burmese">
                  {contactContent?.formHeading || 'မေးမြန်းလိုသည်များကို ပေးပို့ထားရန်'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-burmese">
                  {contactContent?.formDescription ||
                    'ကျွန်ုပ်တို့အဖွဲ့သားများမှ ရွေးချယ်ထားသော ချန်နယ်သို့ အမြန်ဆုံး အခမဲ့ ပြန်လည်ဆက်သွယ်ပေးပါမည်'}
                </p>
              </div>

              {submitted ? (
                <div className="py-12 text-center space-y-3 font-burmese">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {contactContent?.successHeading || 'ကျေးဇူးတင်ပါသည်၊ အချက်အလက်များ လက်ခံရရှိပါပြီ။'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    {contactContent?.successDescription ||
                      'Solution for You အဖွဲ့သားများမှ မိတ်ဆွေ၏ ဖုန်း/အကောင့်ထံသို့ အမြန်ဆုံး ဆက်သွယ်ပေးပါမည်။'}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-3 px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800"
                  >
                    {contactContent?.sendAnotherButtonText || 'နောက်ထပ် မက်ဆေ့ခ်ျ ပေးပို့ရန်'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 font-burmese text-sm">
                  {/* Anti-spam honeypot (invisible to humans) */}
                  <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                    <label htmlFor="cp_company_website_hp">Leave blank</label>
                    <input
                      id="cp_company_website_hp"
                      type="text"
                      name="cp_company_website_hp"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {contactError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="leading-relaxed">{contactError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {contactContent?.fullNameLabel || 'အမည် သို့မဟုတ် ခေါ်ဆိုရမည့်အမည်'}
                    </label>
                    <input
                      type="text"
                      maxLength={120}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={contactContent?.fullNamePlaceholder || 'ဥပမာ - မောင်မောင်'}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {normalizedPhoneLabel}{' '}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={40}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={contactContent?.formPhonePlaceholder || '08x-xxx-xxxx'}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {contactContent?.serviceTypeLabel || 'ဝန်ဆောင်မှု ရွေးချယ်ရန်'}
                      </label>
                      <select
                        value={serviceChoice}
                        onChange={(e) => setServiceChoice(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-sm bg-white"
                      >
                        {services.map((svc) => (
                          <option key={svc.id} value={svc.title}>
                            {svc.title}
                          </option>
                        ))}
                        <option value="အခြား အထွေထွေ">
                          {contactContent?.serviceOtherOptionLabel || 'အခြား အထွေထွေ အကူအညီ'}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {contactContent?.contactChannelLabel || 'ပြန်လည်ဆက်သွယ်စေလိုသည့် လမ်းကြောင်း'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      {[
                        { id: 'messenger', label: 'Messenger' },
                        { id: 'phone', label: contactContent?.channelPhoneLabel || 'ဖုန်းခေါ်ဆိုရန်' },
                        { id: 'line', label: 'LINE' },
                        { id: 'telegram', label: 'Telegram' },
                        { id: 'email', label: 'Email' },
                      ].map((ch) => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => setChannel(ch.id as any)}
                          className={`py-2 px-2 rounded-xl border text-center transition-colors ${
                            channel === ch.id
                              ? 'border-sky-600 bg-sky-50 text-sky-700 font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {ch.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {contactContent?.messageLabel || 'သိရှိလိုသည့် အကြောင်းအရာ အကျဉ်းချုပ်'}
                    </label>
                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        contactContent?.messagePlaceholder ||
                        'ဥပမာ - ဘဏ်အကောင့်ဖွင့်ရန် စာရွက်စာတမ်း အဆင်မပြေဖြစ်နေလို့ ကူညီပေးနိုင်မလား သိချင်ပါတယ်'
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-colors shadow-xs active:scale-98 disabled:opacity-50"
                  >
                    {loading
                      ? contactContent?.submittingButtonText || 'ပေးပို့နေပါသည်...'
                      : contactContent?.submitButtonText || 'မက်ဆေ့ခ်ျ ပေးပို့မည် (အခမဲ့ တိုင်ပင်ရန်)'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

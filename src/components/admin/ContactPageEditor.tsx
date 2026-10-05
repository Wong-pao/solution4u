import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ContactPageContent } from '../../types';
import { INITIAL_CONTACT_CONTENT } from '../../data/initialData';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  Phone,
  MapPin,
  MessageSquare,
  FileText,
  ExternalLink,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react';

export const ContactPageEditor: React.FC = () => {
  const { contactContent, updateContactContent, navigateTo } = useApp();

  const [formData, setFormData] = useState<ContactPageContent>({
    ...INITIAL_CONTACT_CONTENT,
    ...contactContent,
  });

  const [initialBaseline, setInitialBaseline] = useState<ContactPageContent>({
    ...INITIAL_CONTACT_CONTENT,
    ...contactContent,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<
    'all' | 'header' | 'channels' | 'info' | 'form' | 'feedback'
  >('all');

  useEffect(() => {
    if (contactContent) {
      setFormData((prev) => ({
        ...INITIAL_CONTACT_CONTENT,
        ...prev,
        ...contactContent,
      }));
      setInitialBaseline((prev) => ({
        ...INITIAL_CONTACT_CONTENT,
        ...prev,
        ...contactContent,
      }));
    }
  }, [contactContent]);

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialBaseline);
  }, [formData, initialBaseline]);

  const handleChange = (field: keyof ContactPageContent, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetToBaseline = () => {
    setFormData({ ...initialBaseline });
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);
  };

  const handleResetToFactoryDefaults = () => {
    setFormData({ ...INITIAL_CONTACT_CONTENT });
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !isDirty) return;

    setIsSaving(true);
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);

    try {
      await updateContactContent(formData);
      setInitialBaseline({ ...formData });
      setSaveSuccessMsg('Contact Us စာမျက်နှာ စာသားများကို Supabase တွင် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('[ContactPageEditor] Save error:', err);
      setSaveErrorMsg(err.message || 'သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 font-burmese text-xs">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold mb-2 font-mono">
              <Phone className="w-3.5 h-3.5" />
              <span>CONTACT US CMS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              Contact Us (ဆက်သွယ်ရန် စာမျက်နှာ) စီမံခန့်ခွဲမှု
            </h2>
            <p className="text-slate-500 text-xs leading-relaxed max-w-2xl mt-1">
              Contact Us စာမျက်နှာရှိ ခေါင်းစဉ်၊ ဆက်သွယ်ရန် လမ်းညွှန်ချက်၊ ရုံးဖွင့်ချိန်၊ ဖောင် (Form) စာသားများနှင့် တုံ့ပြန်ချက် မက်ဆေ့ခ်ျများအားလုံးကို စိတ်ကြိုက် ပြင်ဆင်နိုင်ပါသည်။
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('contact')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              <span>Contact Page ကြည့်မည်</span>
              <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
            </button>

            {isDirty && (
              <button
                type="button"
                onClick={handleResetToBaseline}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>မူလအတိုင်း ပြန်ထားမည်</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-xs ${
                !isDirty
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer active:scale-98 shadow-sky-600/20'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>သိမ်းဆည်းနေပါသည်...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>အပြောင်းအလဲများ သိမ်းမည်</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Banners */}
        {saveSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{saveSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {saveErrorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{saveErrorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveErrorMsg(null)}
              className="text-rose-700 hover:text-rose-900 font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Sub-navigation Pills */}
        <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">ကဏ္ဍ ရွေးချယ်ရန်:</span>
          {[
            { id: 'all', label: 'အားလုံး (All)' },
            { id: 'header', label: '၁။ Page Header' },
            { id: 'channels', label: '၂။ Contact Channel Cards' },
            { id: 'info', label: '၃။ Contact Info & Hours' },
            { id: 'form', label: '၄။ Contact Form' },
            { id: 'feedback', label: '၅။ Feedback & Messages' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeSubTab === tab.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. CONTACT PAGE HEADER */}
      {(activeSubTab === 'all' || activeSubTab === 'header') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-sky-600" />
              <span>၁။ Contact Page Header (စာမျက်နှာ ထိပ်ပိုင်း မိတ်ဆက်)</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Contact Us စာမျက်နှာ ထိပ်ဆုံးရှိ တံဆိပ်၊ ပင်မခေါင်းစဉ်နှင့် မိတ်ဆက်စာသား
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Section Label / Badge (အပေါ်ခေါင်းစဉ်ငယ်)
              </label>
              <input
                type="text"
                value={formData.headerBadge || ''}
                onChange={(e) => handleChange('headerBadge', e.target.value)}
                placeholder="ဘန်ကောက်ရှိ မိတ်ဆွေတစ်ယောက်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>

            <div className="sm:col-span-8">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Main Heading (ပင်မခေါင်းစဉ်ကြီး)
              </label>
              <input
                type="text"
                value={formData.headerTitle || ''}
                onChange={(e) => handleChange('headerTitle', e.target.value)}
                placeholder="လူကြီးမင်းတို့၏ စိတ်ကျေနပ်မှုနှင့် စိတ်အေးချမ်းမှုသည် ကျွန်ုပ်တို့၏ အဓိက ပန်းတိုင်ဖြစ်ပါသည်။"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description (မိတ်ဆက် ရှင်းလင်းချက်)
            </label>
            <textarea
              rows={2}
              value={formData.headerSubtitle || ''}
              onChange={(e) => handleChange('headerSubtitle', e.target.value)}
              placeholder="ဘန်ကောက်တွင် နေထိုင်အလုပ်လုပ်ကိုင်နေကြတဲ့ အကို၊အမတို့၏ ဗီဇာ၊ စာရွက်စာတမ်းနှင့် နေထိုင်ရေးဆိုင်ရာ..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
            />
          </div>
        </div>
      )}

      {/* 2. QUICK CONTACT CHANNEL CARDS */}
      {(activeSubTab === 'all' || activeSubTab === 'channels') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-600" />
              <span>၂။ Contact Channel Cards (တိုက်ရိုက်ဆက်သွယ်ရန် ခလုတ် ၅ ခု)</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              1. Messenger, 2. Phone, 3. LINE, 4. Telegram, 5. Email ကတ်များပေါ်ရှိ စာသားများ (ဖုန်းနံပါတ်နှင့် လင့်ခ်များကို Global Settings မှ ဗဟိုချုပ်ကိုင် ချိတ်ဆက်ထားပါသည်)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Messenger Card (Primary) */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-blue-800 uppercase">1. Messenger Card (Primary)</h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.messengerButtonTitle || ''}
                  onChange={(e) => handleChange('messengerButtonTitle', e.target.value)}
                  placeholder="Messenger"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Subtext</label>
                <input
                  type="text"
                  value={formData.messengerButtonSubtext || ''}
                  onChange={(e) => handleChange('messengerButtonSubtext', e.target.value)}
                  placeholder="Facebook Chat"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>

            {/* 2. Phone Card & 3. LINE Card */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase">2. Phone & 3. LINE Cards</h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">2. Phone Card Title</label>
                <input
                  type="text"
                  value={formData.phoneButtonTitle || ''}
                  onChange={(e) => handleChange('phoneButtonTitle', e.target.value)}
                  placeholder="Call Now"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">3. LINE Card Title</label>
                <input
                  type="text"
                  value={formData.lineButtonTitle || ''}
                  onChange={(e) => handleChange('lineButtonTitle', e.target.value)}
                  placeholder="LINE ID"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                />
              </div>
            </div>

            {/* 4. Telegram Card */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-sky-800 uppercase">4. Telegram Card</h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.telegramButtonTitle || ''}
                  onChange={(e) => handleChange('telegramButtonTitle', e.target.value)}
                  placeholder="Telegram"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Subtext</label>
                <input
                  type="text"
                  value={formData.telegramButtonSubtext || formData.whatsappButtonSubtext || ''}
                  onChange={(e) => handleChange('telegramButtonSubtext', e.target.value)}
                  placeholder="တိုက်ရိုက် စာပို့ရန်"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>

            {/* 5. Email Card */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 sm:col-span-2 lg:col-span-3">
              <h4 className="text-xs font-bold text-sky-800 uppercase">5. Email Card</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.emailButtonTitle || ''}
                    onChange={(e) => handleChange('emailButtonTitle', e.target.value)}
                    placeholder="Email"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Subtext</label>
                  <input
                    type="text"
                    value={formData.emailButtonSubtext || ''}
                    onChange={(e) => handleChange('emailButtonSubtext', e.target.value)}
                    placeholder="အီးမေးလ် ပို့ရန်"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTACT INFORMATION & BUSINESS HOURS */}
      {(activeSubTab === 'all' || activeSubTab === 'info') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>၃။ Contact Information & Business Hours (ရုံးလိပ်စာနှင့် ရုံးဖွင့်ချိန်)</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              ဘယ်ဘက်ခြမ်းရှိ ရုံးတည်နေရာ၊ ဖုန်း၊ အီးမေးလ် ခေါင်းစဉ်ငယ်များ၊ ရုံးဖွင့်ချိန်နှင့် လမ်းညွှန်ချက် စာသားများ
            </p>
          </div>

          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider">
              (A) Office Address & Contact Labels
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Info Box Heading (ဘယ်ဘက်ကတ် ခေါင်းစဉ်)
                </label>
                <input
                  type="text"
                  value={formData.infoSectionTitle || ''}
                  onChange={(e) => handleChange('infoSectionTitle', e.target.value)}
                  placeholder="ရုံးတည်နေရာနှင့် ဆက်သွယ်ရန်"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Address Label (လိပ်စာ ခေါင်းစဉ်ငယ်)
                </label>
                <input
                  type="text"
                  value={formData.addressLabel || ''}
                  onChange={(e) => handleChange('addressLabel', e.target.value)}
                  placeholder="Office Address"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Location / Address Text (ရုံးလိပ်စာ စာသား)
              </label>
              <input
                type="text"
                value={formData.addressText || ''}
                onChange={(e) => handleChange('addressText', e.target.value)}
                placeholder="Soi Lat Phrao 107, Khlong Chan, Bang Kapi, Bangkok 10240, Thailand."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Label (ဖုန်း ခေါင်းစဉ်ငယ်)
                </label>
                <input
                  type="text"
                  value={formData.phoneLabel || ''}
                  onChange={(e) => handleChange('phoneLabel', e.target.value)}
                  placeholder="Phone Number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Label (အီးမေးလ် ခေါင်းစဉ်ငယ်)
                </label>
                <input
                  type="text"
                  value={formData.emailLabel || ''}
                  onChange={(e) => handleChange('emailLabel', e.target.value)}
                  placeholder="Email Address"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider">
              (B) Business Hours & Availability
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Hours Heading (ရုံးဖွင့်ချိန် ခေါင်းစဉ်)
                </label>
                <input
                  type="text"
                  value={formData.hoursHeading || ''}
                  onChange={(e) => handleChange('hoursHeading', e.target.value)}
                  placeholder="ရုံးဖွင့်ချိန် (Business Hours)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Weekday Hours (တနင်္လာ - သောကြာ ဖွင့်ချိန်)
                </label>
                <input
                  type="text"
                  value={formData.hoursWeekday || ''}
                  onChange={(e) => handleChange('hoursWeekday', e.target.value)}
                  placeholder="Monday – Friday: 9:00 AM – 5:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Weekend Status (စနေ/တနင်္ဂနွေ ပိတ်ရက်စာသား)
                </label>
                <input
                  type="text"
                  value={formData.hoursWeekendClosed || ''}
                  onChange={(e) => handleChange('hoursWeekendClosed', e.target.value)}
                  placeholder="Saturday & Sunday: Office closed."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Weekend Availability Note (မက်ဆေ့ခ်ျချန်ထားနိုင်ကြောင်း အသိပေးချက်)
                </label>
                <input
                  type="text"
                  value={formData.hoursWeekendNote || ''}
                  onChange={(e) => handleChange('hoursWeekendNote', e.target.value)}
                  placeholder="သို့သော် မိတ်ဆွေများအနေဖြင့် Messenger သို့မဟုတ် LINE တွင် မက်ဆေ့ခ်ျ ချန်ထားခဲ့နိုင်ပါသည်။"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider">
              (C) Location Guide Notice (လမ်းညွှန်ချက်)
            </h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Location Guide Heading (လမ်းညွှန်ချက် ခေါင်းစဉ်)
              </label>
              <input
                type="text"
                value={formData.locationGuideHeading || ''}
                onChange={(e) => handleChange('locationGuideHeading', e.target.value)}
                placeholder="Bangkok လမ်းညွှန်ချက် -"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Location Guide Text (လမ်းညွှန်ချက် အသေးစိတ်)
              </label>
              <textarea
                rows={2}
                value={formData.locationGuideText || ''}
                onChange={(e) => handleChange('locationGuideText', e.target.value)}
                placeholder="Lat Phrao 107 အနီးဝန်းကျင်တွင် တည်ရှိပြီး၊ လူကိုယ်တိုင် လာရောက်လိုပါက..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. CONTACT FORM LABELS & PLACEHOLDERS */}
      {(activeSubTab === 'all' || activeSubTab === 'form') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>၄။ Contact Form (ဆက်သွယ်ရန် ဖောင် စာသားများ)</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              ညာဘက်ခြမ်းရှိ မေးမြန်းရန် ဖောင်၏ ခေါင်းစဉ်၊ အကွက်အမည်များ (Labels)၊ နမူနာစာသားများ (Placeholders) နှင့် ပေးပို့သည့် ခလုတ်စာသား
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Form Heading (ဖောင် ခေါင်းစဉ်)
              </label>
              <input
                type="text"
                value={formData.formHeading || ''}
                onChange={(e) => handleChange('formHeading', e.target.value)}
                placeholder="မေးမြန်းလိုသည်များကို ပေးပို့ထားရန်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Form Description (ဖောင် ရှင်းလင်းချက်)
              </label>
              <input
                type="text"
                value={formData.formDescription || ''}
                onChange={(e) => handleChange('formDescription', e.target.value)}
                placeholder="ကျွန်ုပ်တို့အဖွဲ့သားများမှ ရွေးချယ်ထားသော ချန်နယ်သို့ အမြန်ဆုံး အခမဲ့ ပြန်လည်ဆက်သွယ်ပေးပါမည်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name Label (အမည် အကွက်ခေါင်းစဉ်)
              </label>
              <input
                type="text"
                value={formData.fullNameLabel || ''}
                onChange={(e) => handleChange('fullNameLabel', e.target.value)}
                placeholder="အမည် သို့မဟုတ် ခေါ်ဆိုရမည့်အမည်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name Placeholder (အမည် နမူနာစာသား)
              </label>
              <input
                type="text"
                value={formData.fullNamePlaceholder || ''}
                onChange={(e) => handleChange('fullNamePlaceholder', e.target.value)}
                placeholder="ဥပမာ - မောင်မောင်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Label (ဖုန်းနံပါတ် အကွက်ခေါင်းစဉ်)
              </label>
              <input
                type="text"
                value={formData.formPhoneLabel || ''}
                onChange={(e) => handleChange('formPhoneLabel', e.target.value)}
                placeholder="ဆက်သွယ်ရန် ဖုန်းနံပါတ်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Placeholder (ဖုန်းနံပါတ် နမူနာစာသား)
              </label>
              <input
                type="text"
                value={formData.formPhonePlaceholder || ''}
                onChange={(e) => handleChange('formPhonePlaceholder', e.target.value)}
                placeholder="08x-xxx-xxxx"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Service Type Label (ဝန်ဆောင်မှု ရွေးချယ်ရန် ခေါင်းစဉ်)
              </label>
              <input
                type="text"
                value={formData.serviceTypeLabel || ''}
                onChange={(e) => handleChange('serviceTypeLabel', e.target.value)}
                placeholder="ဝန်ဆောင်မှု ရွေးချယ်ရန်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Other Service Option (အခြားဝန်ဆောင်မှု ရွေးချယ်မှုစာသား)
              </label>
              <input
                type="text"
                value={formData.serviceOtherOptionLabel || ''}
                onChange={(e) => handleChange('serviceOtherOptionLabel', e.target.value)}
                placeholder="အခြား အထွေထွေ အကူအညီ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Channel Label (ဆက်သွယ်ရန် လမ်းကြောင်း ခေါင်းစဉ်)
              </label>
              <input
                type="text"
                value={formData.contactChannelLabel || ''}
                onChange={(e) => handleChange('contactChannelLabel', e.target.value)}
                placeholder="ပြန်လည်ဆက်သွယ်စေလိုသည့် လမ်းကြောင်း"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Channel Option (ဖုန်းခေါ်ဆိုရန် ခလုတ်စာသား)
              </label>
              <input
                type="text"
                value={formData.channelPhoneLabel || ''}
                onChange={(e) => handleChange('channelPhoneLabel', e.target.value)}
                placeholder="ဖုန်းခေါ်ဆိုရန်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Message Label (အကြောင်းအရာ အကွက်ခေါင်းစဉ်)
              </label>
              <input
                type="text"
                value={formData.messageLabel || ''}
                onChange={(e) => handleChange('messageLabel', e.target.value)}
                placeholder="သိရှိလိုသည့် အကြောင်းအရာ အကျဉ်းချုပ်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Message Placeholder (အကြောင်းအရာ နမူနာစာသား)
              </label>
              <textarea
                rows={2}
                value={formData.messagePlaceholder || ''}
                onChange={(e) => handleChange('messagePlaceholder', e.target.value)}
                placeholder="ဥပမာ - ဘဏ်အကောင့်ဖွင့်ရန် စာရွက်စာတမ်း အဆင်မပြေဖြစ်နေလို့ ကူညီပေးနိုင်မလား သိချင်ပါတယ်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Submit Button Text (ပေးပို့မည် ခလုတ်စာသား)
              </label>
              <input
                type="text"
                value={formData.submitButtonText || ''}
                onChange={(e) => handleChange('submitButtonText', e.target.value)}
                placeholder="မက်ဆေ့ခ်ျ ပေးပို့မည် (အခမဲ့ တိုင်ပင်ရန်)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Submitting State Text (ပေးပို့နေစဉ် ပြသမည့်စာသား)
              </label>
              <input
                type="text"
                value={formData.submittingButtonText || ''}
                onChange={(e) => handleChange('submittingButtonText', e.target.value)}
                placeholder="ပေးပို့နေပါသည်..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. FEEDBACK & VALIDATION MESSAGES */}
      {(activeSubTab === 'all' || activeSubTab === 'feedback') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>၅။ Feedback & Validation Messages (တုံ့ပြန်ချက်နှင့် အသိပေးစာသားများ)</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              ဖောင်ပေးပို့ပြီးချိန် ပြသသည့် အောင်မြင်ကြောင်း စာသားနှင့် ဖုန်းနံပါတ် စစ်ဆေးချက် သတိပေးစာသားများ
            </p>
          </div>

          <div className="space-y-4 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              (A) Submission Success State
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Success Heading (အောင်မြင်ကြောင်း ခေါင်းစဉ်)
                </label>
                <input
                  type="text"
                  value={formData.successHeading || ''}
                  onChange={(e) => handleChange('successHeading', e.target.value)}
                  placeholder="ကျေးဇူးတင်ပါသည်၊ အချက်အလက်များ လက်ခံရရှိပါပြီ။"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Send Another Button Text (နောက်ထပ်ပေးပို့ရန် ခလုတ်စာသား)
                </label>
                <input
                  type="text"
                  value={formData.sendAnotherButtonText || ''}
                  onChange={(e) => handleChange('sendAnotherButtonText', e.target.value)}
                  placeholder="နောက်ထပ် မက်ဆေ့ခ်ျ ပေးပို့ရန်"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Success Description (အောင်မြင်ကြောင်း အသေးစိတ်စာသား)
              </label>
              <textarea
                rows={2}
                value={formData.successDescription || ''}
                onChange={(e) => handleChange('successDescription', e.target.value)}
                placeholder="Solution for You အဖွဲ့သားများမှ မိတ်ဆွေ၏ ဖုန်း/အကောင့်ထံသို့ အမြန်ဆုံး ဆက်သွယ်ပေးပါမည်။"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>

          <div className="space-y-4 p-5 rounded-2xl bg-amber-50/50 border border-amber-200/70">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              (B) Validation & Error Messages
            </h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Invalid Phone Message (ဖုန်းနံပါတ် မပြည့်စုံပါက ပြသမည့်စာသား)
              </label>
              <input
                type="text"
                value={formData.invalidPhoneMessage || ''}
                onChange={(e) => handleChange('invalidPhoneMessage', e.target.value)}
                placeholder="ကျေးဇူးပြု၍ မှန်ကန်သော ဖုန်းနံပါတ် ရိုက်ထည့်ပေးပါ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rate-Limit Notice (ဆက်တိုက်ပေးပို့မှု ခေတ္တစောင့်ဆိုင်းရန် သတိပေးချက်)
              </label>
              <input
                type="text"
                value={formData.rateLimitMessage || ''}
                onChange={(e) => handleChange('rateLimitMessage', e.target.value)}
                placeholder="မကြာသေးမီက စာပို့ထားပြီးဖြစ်ပါသည်။ ခေတ္တစောင့်ဆိုင်းပြီးမှ ထပ်မံပေးပို့ပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Generic Submission Error Message (အမှားဖြစ်ပေါ်ပါက ပြသမည့်စာသား)
              </label>
              <textarea
                rows={2}
                value={formData.errorMessage || ''}
                onChange={(e) => handleChange('errorMessage', e.target.value)}
                placeholder="မက်ဆေ့ခ်ျ ပေးပို့ရာတွင် အဆင်မပြေဖြစ်သွားပါသည်- ကျေးဇူးပြု၍ အထက်ပါ Messenger၊ ဖုန်းနံပါတ် သို့မဟုတ် LINE ဖြင့်..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Save Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isDirty ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              မသိမ်းဆည်းရသေးသော အပြောင်းအလဲများ ရှိနေပါသည်
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              အပြောင်းအလဲများအားလုံး သိမ်းဆည်းပြီးပါပြီ
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleResetToFactoryDefaults}
            disabled={isSaving}
            className="text-xs text-slate-500 hover:text-slate-800 underline px-2 py-1 transition-colors"
          >
            မူလစံပြုစာသားများသို့ ပြန်ထားမည် (Reset All)
          </button>

          <button
            type="submit"
            disabled={isSaving || !isDirty}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-xs text-xs ${
              !isDirty
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer active:scale-98 shadow-sky-600/20'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>သိမ်းဆည်းနေပါသည်...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>သိမ်းဆည်းမည်</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StaticPageContent } from '../../types';
import { INITIAL_STATIC_PAGE_CONTENT } from '../../data/initialData';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  FileText,
  Home,
  Layers,
  Info,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const StaticContentEditor: React.FC = () => {
  const { staticPageContent, updateStaticPageContent, navigateTo } = useApp();

  const [formData, setFormData] = useState<StaticPageContent>({
    ...INITIAL_STATIC_PAGE_CONTENT,
    ...staticPageContent,
  });

  const [initialBaseline, setInitialBaseline] = useState<StaticPageContent>({
    ...INITIAL_STATIC_PAGE_CONTENT,
    ...staticPageContent,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'home' | 'footer' | 'services' | 'service-detail' | 'blog' | 'article-cta'>('all');

  // Sync state if staticPageContent changes externally
  useEffect(() => {
    if (staticPageContent) {
      setFormData((prev) => ({
        ...INITIAL_STATIC_PAGE_CONTENT,
        ...prev,
        ...staticPageContent,
      }));
      setInitialBaseline((prev) => ({
        ...INITIAL_STATIC_PAGE_CONTENT,
        ...prev,
        ...staticPageContent,
      }));
    }
  }, [staticPageContent]);

  // Dirty state detection
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialBaseline);
  }, [formData, initialBaseline]);

  const handleChange = (field: keyof StaticPageContent, value: string) => {
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
    setFormData({ ...INITIAL_STATIC_PAGE_CONTENT });
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);

    try {
      await updateStaticPageContent(formData);
      setInitialBaseline({ ...formData });
      setSaveSuccessMsg('ဝက်ဘ်ဆိုက် စာသားများကို Supabase တွင် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('[StaticContentEditor] Save error:', err);
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
              <FileText className="w-3.5 h-3.5" />
              <span>STATIC PAGE CONTENT CMS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              ဝက်ဘ်ဆိုက် စာမျက်နှာများရှိ စာသားများ ပြင်ဆင်ခြင်း
            </h2>
            <p className="text-slate-500 text-xs leading-relaxed max-w-2xl mt-1">
              Home Page, Footer, Services Page, Service Detail နှင့် Content Page များတွင် ဖော်ပြထားသော ခေါင်းစဉ်နှင့် ရှင်းလင်းချက် စာသားများကို စိတ်ကြိုက် ပြင်ဆင်နိုင်ပါသည်။
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
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

        {/* Filter Pills */}
        <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">စာမျက်နှာ ရွေးချယ်ရန်:</span>
          {[
            { id: 'all', label: 'အားလုံး (All)' },
            { id: 'home', label: '၁။ Home Page' },
            { id: 'footer', label: '၂။ Footer' },
            { id: 'services', label: '၃။ Services Page' },
            { id: 'service-detail', label: '၄။ Service Detail Page' },
            { id: 'blog', label: '၅။ Content / Knowledge Page' },
            { id: 'article-cta', label: '၆။ Article Detail CTA' },
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

      {/* 1. HOME PAGE SECTION */}
      {(activeSubTab === 'all' || activeSubTab === 'home') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Home className="w-4 h-4 text-sky-600" />
                <span>၁။ Home Page စာသားများ</span>
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Knowledge Center၊ Facebook အသိပေးချက်၊ Brand Profile နှင့် Emotional CTA စာသားများ
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="text-xs text-sky-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Home ကြည့်မည်</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* A. Knowledge Center Section */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-sky-800">
              (A) Knowledge Center ဆောင်းပါး ကဏ္ဍ
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Section Label (အပေါ်ခေါင်းစဉ်ငယ်)
                </label>
                <input
                  type="text"
                  value={formData.homeKnowledgeKicker || ''}
                  onChange={(e) => handleChange('homeKnowledgeKicker', e.target.value)}
                  placeholder="KNOWLEDGE CENTER"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>
              <div className="sm:col-span-8">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Section Heading (ပင်မခေါင်းစဉ်)
                </label>
                <input
                  type="text"
                  value={formData.homeKnowledgeTitle || ''}
                  onChange={(e) => handleChange('homeKnowledgeTitle', e.target.value)}
                  placeholder="အသုံးဝင်တဲ့ အချက်အလက်များ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Section Description (အကျဉ်းချုပ် ရှင်းလင်းချက်)
              </label>
              <textarea
                rows={2}
                value={formData.homeKnowledgeSubtitle || ''}
                onChange={(e) => handleChange('homeKnowledgeSubtitle', e.target.value)}
                placeholder="ထိုင်းနိုင်ငံရောက် မြန်မာမိတ်ဆွေများအတွက် လက်တွေ့အသုံးဝင်မယ့် သတင်းအချက်အလက်များ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>
          </div>

          {/* B. Facebook Page Official Update */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-sky-800">
              (B) Facebook Page Official Update ကဏ္ဍ
            </h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Heading (ခေါင်းစဉ်ကြီး)
              </label>
              <input
                type="text"
                value={formData.homeFacebookTitle || ''}
                onChange={(e) => handleChange('homeFacebookTitle', e.target.value)}
                placeholder="နေ့စဉ် အချိန်နှင့်တပြေးညီ သတင်းများနှင့် အချက်အလက်များ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description (အသေးစိတ် ရှင်းလင်းချက်)
              </label>
              <textarea
                rows={3}
                value={formData.homeFacebookSubtitle || ''}
                onChange={(e) => handleChange('homeFacebookSubtitle', e.target.value)}
                placeholder="ထိုင်းနိုင်ငံ လဝက သတင်းများ၊ ဗီဇာနှင့် Work Permit အပြောင်းအလဲများ..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>
          </div>

          {/* C. Brand Profile Area */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-sky-800">
              (C) Home Brand Profile အကွက် (Facebook Section ညာဘက်ခြမ်း)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brand / Profile Name (အမည်)
                </label>
                <input
                  type="text"
                  value={formData.brandProfileName || ''}
                  onChange={(e) => handleChange('brandProfileName', e.target.value)}
                  placeholder="Solution for You - အဖြေက ဒီမှာပါ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtitle (စာတန်းငယ်)
                </label>
                <input
                  type="text"
                  value={formData.brandProfileSubtitle || ''}
                  onChange={(e) => handleChange('brandProfileSubtitle', e.target.value)}
                  placeholder="Bangkok Myanmar Service Agency"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supporting Statement (ထောက်ခံစာသား)
                </label>
                <input
                  type="text"
                  value={formData.brandProfileSupportingText || ''}
                  onChange={(e) => handleChange('brandProfileSupportingText', e.target.value)}
                  placeholder="မိတ်ဆွေများအတွက် စိတ်ချရသော အကူအညီ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Messenger Availability Statement (မက်ဆေ့ခ်ျ ပို့နိုင်သည့်အချိန်)
                </label>
                <input
                  type="text"
                  value={formData.brandProfileMessengerHours || ''}
                  onChange={(e) => handleChange('brandProfileMessengerHours', e.target.value)}
                  placeholder="Facebook & Messenger တွင် ၂၄ နာရီ မက်ဆေ့ခ်ျ ပို့ထားနိုင်ပါသည်"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>
            </div>
          </div>

          {/* D. Emotional CTA Section */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-sky-800">
              (D) Emotional / Final CTA ကဏ္ဍ
            </h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CTA Heading (ခေါင်းစဉ်)
              </label>
              <input
                type="text"
                value={formData.homeCtaTitle || ''}
                onChange={(e) => handleChange('homeCtaTitle', e.target.value)}
                placeholder="အခက်အခဲရှိနေပါသလား?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CTA Description (ဖိတ်ခေါ်စာသား)
              </label>
              <textarea
                rows={2}
                value={formData.homeCtaSubtitle || ''}
                onChange={(e) => handleChange('homeCtaSubtitle', e.target.value)}
                placeholder="မိမိကိုယ်တိုင် ရှုပ်ထွေးစွာ ဖြေရှင်းနေစရာမလိုပါဘူး..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. FOOTER SECTION */}
      {(activeSubTab === 'all' || activeSubTab === 'footer') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-600" />
                <span>၂။ Footer စာသား</span>
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                ဝက်ဘ်ဆိုက် အောက်ခြေ Logo အောက်ရှိ မိတ်ဆက်ရှင်းလင်းချက် စာသား
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Footer Description (အောက်ခြေ မိတ်ဆက်စာသား)
            </label>
            <textarea
              rows={3}
              value={formData.footerDescription || ''}
              onChange={(e) => handleChange('footerDescription', e.target.value)}
              placeholder="ဗီဇာ၊ စာရွက်စာတမ်းနှင့် နေထိုင်ရေးဆိုင်ရာ ဝန်ဆောင်မှုများကို တစ်နေရာတည်းမှာ အလွယ်တကူ ရယူနိုင်ရန် ကူညီပေးနေပါတယ်။.."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
            />
          </div>
        </div>
      )}

      {/* 3. SERVICES PAGE SECTION */}
      {(activeSubTab === 'all' || activeSubTab === 'services') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                <span>၃။ Services Page စာသားများ</span>
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Our Services စာမျက်နှာထိပ်ပိုင်းရှိ ပင်မမိတ်ဆက်ခေါင်းစဉ်နှင့် အောက်ခြေရှိ တရားဝင် တာဝန်ယူမှု အာမခံချက် စာသားများ
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('services')}
              className="text-xs text-sky-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Services ကြည့်မည်</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* (A) Services Page — Main Introduction */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-sky-800">
              (A) Services Page — Main Introduction (ပင်မ မိတ်ဆက် ခေါင်းစဉ်)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Section Label (ခေါင်းစဉ်ငယ်)
                </label>
                <input
                  type="text"
                  value={formData.servicesHeaderKicker || ''}
                  onChange={(e) => handleChange('servicesHeaderKicker', e.target.value)}
                  placeholder="COMPREHENSIVE SERVICES"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>
              <div className="sm:col-span-8">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Main Heading (ပင်မခေါင်းစဉ်ကြီး)
                </label>
                <input
                  type="text"
                  value={formData.servicesHeaderTitle || ''}
                  onChange={(e) => handleChange('servicesHeaderTitle', e.target.value)}
                  placeholder="ကျွန်ုပ်တို့၏ ဝန်ဆောင်မှုများ"
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
                value={formData.servicesHeaderSubtitle || ''}
                onChange={(e) => handleChange('servicesHeaderSubtitle', e.target.value)}
                placeholder="ဘန်ကောက်မြို့တွင် မြန်မာမိတ်ဆွေများ အဆင်ပြေချောမွေ့စွာ နေထိုင်နိုင်ရန် ဗီဇာ၊ စာရွက်စာတမ်း..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>
          </div>

          {/* (B) Services Page — Trust / Disclaimer */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-sky-800">
              (B) Services Page — Trust / Disclaimer (တရားဝင် တာဝန်ယူမှု အာမခံချက်)
            </h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trust Statement (အာမခံ ခေါင်းစဉ်)
              </label>
              <input
                type="text"
                value={formData.servicesTrustTitle || ''}
                onChange={(e) => handleChange('servicesTrustTitle', e.target.value)}
                placeholder="တရားဝင် စည်းမျဉ်းများနှင့်အညီ သာ တာဝန်ယူ ဆောင်ရွက်ပေးပါသည်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trust Description (အာမခံ အသေးစိတ် ရှင်းလင်းချက်)
              </label>
              <textarea
                rows={2}
                value={formData.servicesTrustSubtitle || ''}
                onChange={(e) => handleChange('servicesTrustSubtitle', e.target.value)}
                placeholder="မည်သည့်ဝန်ဆောင်မှုတွင်မဆို လျှို့ဝှက်စရိတ် မရှိစေဘဲ လုပ်ငန်းစဉ်အစအဆုံးကို ကြိုတင်ရှင်းလင်းစွာ တိုင်ပင်ဆွေးနွေးပေးပါသည်။"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. SERVICE DETAIL PAGE SECTION */}
      {(activeSubTab === 'all' || activeSubTab === 'service-detail') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-sky-600" />
                <span>၄။ Service Detail Page (Standard Support Section & Disclaimer)</span>
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                ဝန်ဆောင်မှု အသေးစိတ် စာမျက်နှာ (၁၂) ခုစလုံးတွင် ဘုံမျှဝေအသုံးပြုသော Support Checklist နှင့် ဥပဒေရေးရာ Disclaimer
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Support Section Heading (ကူညီပေးမည့် အချက်များ ခေါင်းစဉ်)
            </label>
            <input
              type="text"
              value={formData.serviceDetailSupportHeading || ''}
              onChange={(e) => handleChange('serviceDetailSupportHeading', e.target.value)}
              placeholder="ကျွန်ုပ်တို့ အစအဆုံး ကူညီပေးမည့် အချက်များ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
            />
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-sky-800">
              Support Checklist (အချက် ၄ ချက်)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bullet 1 (အချက် ၁)
                </label>
                <input
                  type="text"
                  value={formData.serviceDetailSupportBullet1 || ''}
                  onChange={(e) => handleChange('serviceDetailSupportBullet1', e.target.value)}
                  placeholder="လိုအပ်သော စာရွက်စာတမ်းများ ကြိုတင်စစ်ဆေးပေးခြင်း"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bullet 2 (အချက် ၂)
                </label>
                <input
                  type="text"
                  value={formData.serviceDetailSupportBullet2 || ''}
                  onChange={(e) => handleChange('serviceDetailSupportBullet2', e.target.value)}
                  placeholder="ဘာသာစကားနှင့် ဆက်သွယ်ရေး အခက်အခဲမရှိအောင် ကူညီခြင်း"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bullet 3 (အချက် ၃)
                </label>
                <input
                  type="text"
                  value={formData.serviceDetailSupportBullet3 || ''}
                  onChange={(e) => handleChange('serviceDetailSupportBullet3', e.target.value)}
                  placeholder="ရက်ချိန်းနှင့် တရားဝင် လုပ်ထုံးလုပ်နည်းများ စီစဉ်ပေးခြင်း"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bullet 4 (အချက် ၄)
                </label>
                <input
                  type="text"
                  value={formData.serviceDetailSupportBullet4 || ''}
                  onChange={(e) => handleChange('serviceDetailSupportBullet4', e.target.value)}
                  placeholder="လုပ်ငန်းစဉ် အောင်မြင်သည်အထိ အနီးကပ် တွဲခေါ်ဆောင်ရွက်ပေးခြင်း"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notice / Disclaimer (သတိပြုရန် ဥပဒေရေးရာ အသိပေးချက်)
            </label>
            <textarea
              rows={3}
              value={formData.serviceDetailNoticeDisclaimer || ''}
              onChange={(e) => handleChange('serviceDetailNoticeDisclaimer', e.target.value)}
              placeholder="သတိပြုရန် - Solution for You သည် ပုဂ္ဂလိက ဝန်ဆောင်မှု အကူအညီပေးရေး လုပ်ငန်းဖြစ်ပြီး အစိုးရရုံးဌာန မဟုတ်ပါ။.."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
            />
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-sky-800">
              Service Detail CTA Button Labels (ဆက်သွယ်ရန် ခလုတ်စာသားများ)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Button (Messenger ခလုတ်)
                </label>
                <input
                  type="text"
                  value={formData.serviceDetailPrimaryBtn || ''}
                  onChange={(e) => handleChange('serviceDetailPrimaryBtn', e.target.value)}
                  placeholder="Messenger မှ တိုက်ရိုက်မေးမြန်းရန်"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Secondary Button (ဖုန်းခေါ်ရန် ခလုတ်)
                </label>
                <input
                  type="text"
                  value={formData.serviceDetailSecondaryBtn || ''}
                  onChange={(e) => handleChange('serviceDetailSecondaryBtn', e.target.value)}
                  placeholder="ဖုန်းတိုက်ရိုက်ခေါ်ဆိုရန်"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tertiary Button (တိုင်ပင်လွှာ ပို့ရန် ခလုတ်)
                </label>
                <input
                  type="text"
                  value={formData.serviceDetailTertiaryBtn || ''}
                  onChange={(e) => handleChange('serviceDetailTertiaryBtn', e.target.value)}
                  placeholder="အခမဲ့ တိုင်ပင်လွှာ ပို့ရန်"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CONTENT / KNOWLEDGE CENTER PAGE SECTION */}
      {(activeSubTab === 'all' || activeSubTab === 'blog') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>၅။ Content / Knowledge Center Page (သုတစုံလင် ဗဟုသုတစင်တာ)</span>
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Contents / Blog စာမျက်နှာထိပ်ပိုင်းရှိ ခေါင်းစဉ်နှင့် ရှင်းလင်းချက် စာသားများ
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('blog')}
              className="text-xs text-sky-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Blog ကြည့်မည်</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Section Label (ခေါင်းစဉ်ငယ်)
              </label>
              <input
                type="text"
                value={formData.blogPageKicker || ''}
                onChange={(e) => handleChange('blogPageKicker', e.target.value)}
                placeholder="KNOWLEDGE CENTER"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>
            <div className="sm:col-span-8">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Heading (ပင်မခေါင်းစဉ်)
              </label>
              <input
                type="text"
                value={formData.blogPageTitle || ''}
                onChange={(e) => handleChange('blogPageTitle', e.target.value)}
                placeholder="သုတစုံလင် ဗဟုသုတစင်တာ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description (အကျဉ်းချုပ် ရှင်းလင်းချက်)
            </label>
            <textarea
              rows={2}
              value={formData.blogPageSubtitle || ''}
              onChange={(e) => handleChange('blogPageSubtitle', e.target.value)}
              placeholder="ထိုင်းနိုင်ငံရောက် မြန်မာမိတ်ဆွေများ နေ့စဉ်သိရှိထားသင့်သည့် ဗီဇာ၊ Work Permit..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
            />
          </div>
        </div>
      )}

      {/* 6. ARTICLE DETAIL CTA SECTION */}
      {(activeSubTab === 'all' || activeSubTab === 'article-cta' || activeSubTab === 'blog') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-600" />
                <span>၆။ Article Detail CTA (ဆောင်းပါးအောက်ခြေ အကူအညီတောင်းခံရန် ကဏ္ဍ)</span>
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                ဆောင်းပါး အသေးစိတ် စာမျက်နှာတိုင်း၏ အောက်ခြေတွင် ဘုံမျှဝေဖော်ပြသော အကူအညီတောင်းခံရန် CTA စာသားများ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CTA Badge / Title (အပေါ်ခေါင်းစဉ်ငယ်)
              </label>
              <input
                type="text"
                value={formData.articleCtaBadge || ''}
                onChange={(e) => handleChange('articleCtaBadge', e.target.value)}
                placeholder="Solution for You အကူအညီ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>
            <div className="sm:col-span-8">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CTA Heading / Question (ပင်မ မေးခွန်းခေါင်းစဉ်)
              </label>
              <input
                type="text"
                value={formData.articleCtaHeading || ''}
                onChange={(e) => handleChange('articleCtaHeading', e.target.value)}
                placeholder="ဤကိစ္စရပ်နှင့် ပတ်သက်ပြီး စာရွက်စာတမ်း အခက်အခဲ ရှိနေပါသလား?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              CTA Description (အသေးစိတ် ရှင်းလင်းချက် စာသား)
            </label>
            <textarea
              rows={2}
              value={formData.articleCtaDescription || ''}
              onChange={(e) => handleChange('articleCtaDescription', e.target.value)}
              placeholder="မိတ်ဆွေ၏ နိုင်ငံကူးလက်မှတ် သို့မဟုတ် စာရွက်စာတမ်းကို ဓာတ်ပုံရိုက်ပို့ပြီး Solution for You ထံ အခမဲ့ စစ်ဆေးတိုင်ပင်နိုင်ပါသည်။"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Button Label (ပင်မ ခလုတ်စာသား)
              </label>
              <input
                type="text"
                value={formData.articleCtaPrimaryBtn || ''}
                onChange={(e) => handleChange('articleCtaPrimaryBtn', e.target.value)}
                placeholder="အခမဲ့ တိုင်ပင်ဆွေးနွေးရန်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Secondary Button Label (Messenger ခလုတ်စာသား)
              </label>
              <input
                type="text"
                value={formData.articleCtaSecondaryBtn || ''}
                onChange={(e) => handleChange('articleCtaSecondaryBtn', e.target.value)}
                placeholder="Messenger မှ တိုက်ရိုက်မေးမြန်းရန်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
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

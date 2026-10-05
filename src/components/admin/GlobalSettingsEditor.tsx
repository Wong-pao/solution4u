import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { siteContentApi } from '../../lib/cms';
import { SiteSettings } from '../../types';
import { INITIAL_SETTINGS } from '../../data/initialData';
import { ImageUploadField } from './ImageUploadField';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  Phone,
  Clock,
  Shield,
  Share2,
  Layers,
  RotateCcw,
  Loader2,
  Info,
} from 'lucide-react';

export const GlobalSettingsEditor: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [formData, setFormData] = useState<SiteSettings>({ ...INITIAL_SETTINGS, ...settings });
  const [initialBaseline, setInitialBaseline] = useState<SiteSettings>({ ...INITIAL_SETTINGS, ...settings });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Fetch freshest data from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const fetched = await siteContentApi.getSiteContent<SiteSettings>(
          'general_settings',
          { ...INITIAL_SETTINGS, ...settings }
        );
        if (isMounted && fetched) {
          const merged = { ...INITIAL_SETTINGS, ...settings, ...fetched };
          setFormData(merged);
          setInitialBaseline(merged);
        }
      } catch (err: any) {
        console.warn('[GlobalSettingsEditor] Load warning:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Track dirty state (unsaved changes)
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialBaseline);
  }, [formData, initialBaseline]);

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFormData({ ...initialBaseline });
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || isSaving) return;

    setIsSaving(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    try {
      // 1. Persist to Supabase site_content table
      const success = await siteContentApi.upsertSiteContent(
        'general_settings',
        'general',
        formData
      );

      if (!success) {
        throw new Error('Supabase သို့ သိမ်းဆည်းရာတွင် အဆင်မပြေဖြစ်သွားပါသည်။ ပြန်လည်ကြိုးစားပေးပါ။');
      }

      // 2. Update global application context and local cache
      await updateSettings(formData);

      // 3. Reset dirty tracking baseline
      setInitialBaseline({ ...formData });
      setSaveSuccessMsg('Global Site Settings အချက်အလက်များကို Supabase ပေါ်သို့ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!');

      // Auto-hide success message after 4 seconds
      setTimeout(() => {
        setSaveSuccessMsg(null);
      }, 4000);
    } catch (err: any) {
      console.error('[GlobalSettingsEditor] Save failed:', err);
      setSaveErrorMsg(err.message || 'သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-left">
      {/* Top Action Bar with Dirty State indicator */}
      <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 font-burmese">
              Global Site Settings (အထွေထွေ အချက်အလက်များ)
            </h2>
            {isDirty ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse font-burmese">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                ပြင်ဆင်ချက် မသိမ်းရသေးပါ
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-burmese">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                အားလုံး သိမ်းဆည်းထားပြီး
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-burmese">
            Supabase `public.site_content` (key: general_settings) နှင့် ချိတ်ဆက်ပြင်ဆင်ခြင်း
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-burmese cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>မူလအတိုင်း ပြန်ထားမည်</span>
            </button>
          )}

          <button
            type="submit"
            disabled={!isDirty || isSaving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs font-burmese ${
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
                <span>သိမ်းဆည်းမည် (Save Changes)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-burmese shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{saveSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-0.5 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {saveErrorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between font-burmese shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{saveErrorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveErrorMsg(null)}
            className="text-rose-700 hover:text-rose-900 font-bold px-2 py-0.5 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. BRAND INFORMATION */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-burmese">Brand Information (လုပ်ငန်း အမည်နှင့် အညွှန်း)</h3>
            <p className="text-[11px] text-slate-500 font-burmese">ဝက်ဘ်ဆိုက် Header နှင့် Footer တွင် ပြသမည့် အမည်များ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-burmese">
              Agency Name (အေဂျင်စီ အမည်) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.agencyName || ''}
              onChange={(e) => handleChange('agencyName', e.target.value)}
              placeholder="Solution for You - အဖြေက ဒီမှာပါ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-burmese">
              Agency Subtext (အညွှန်း စာသားတို)
            </label>
            <input
              type="text"
              value={formData.agencySubtext || ''}
              onChange={(e) => handleChange('agencySubtext', e.target.value)}
              placeholder="ဗီဇာ၊ စာရွက်စာတမ်းနှင့် နေထိုင်ရေးဆိုင်ရာ ဝန်ဆောင်မှုများ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 2. HERO CONTENT */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-burmese">Hero Section Content (မူလစာမျက်နှာ မျက်နှာဖုံးစာသား)</h3>
            <p className="text-[11px] text-slate-500 font-burmese">Homepage ထိပ်ဆုံးတွင် အဓိကမြင်တွေ့ရမည့် ခေါင်းစဉ်ကြီးနှင့် ရှင်းလင်းချက်များ</p>
          </div>
        </div>

        <div className="space-y-4 font-burmese text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hero Headline (ပင်မ ခေါင်းစဉ်ကြီး)
            </label>
            <textarea
              rows={2}
              value={formData.heroHeadline || ''}
              onChange={(e) => handleChange('heroHeadline', e.target.value)}
              placeholder="ဗီဇာ၊ စာရွက်စာတမ်းနဲ့ နေထိုင်ရေးကိစ္စတွေကို တစ်နေရာတည်းမှာ အလွယ်တကူ ဖြေရှင်းလိုက်ပါ။"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hero Supporting Text (အထောက်အကူပြု ရှင်းလင်းချက် စာပိုဒ်)
            </label>
            <textarea
              rows={2}
              value={formData.heroSupportingText || ''}
              onChange={(e) => handleChange('heroSupportingText', e.target.value)}
              placeholder="ဘန်ကောက်မှာ နေထိုင်အလုပ်လုပ်ကိုင်နေကြတဲ့ မြန်မာမိတ်ဆွေများအတွက် လွယ်ကူ၊ မြန်ဆန်၊ စိတ်ချရသော ဝန်ဆောင်မှုများကို..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hero Trust Statement (ယုံကြည်စိတ်ချရမှု အညွှန်း badge)
              </label>
              <input
                type="text"
                value={formData.heroTrustStatement || ''}
                onChange={(e) => handleChange('heroTrustStatement', e.target.value)}
                placeholder="Bangkok မှာ အားကိုးစွာ တိုင်ပင်နိုင်တဲ့ မိတ်ဆွေတစ်ယောက်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Emotional Quote (နွေးထွေးသော စကားလက်ဆောင်)
              </label>
              <input
                type="text"
                value={formData.emotionalQuote || ''}
                onChange={(e) => handleChange('emotionalQuote', e.target.value)}
                placeholder="ဘန်ကောက်မှာ ကိုယ့်ဘက်ကနေ ကူညီပေးမယ့် မိတ်ဆွေတစ်ယောက်ရှိနေတယ်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>
          </div>

          <ImageUploadField
            label="Hero Image (ပင်မစာမျက်နှာ မျက်နှာဖုံး ဓာတ်ပုံ)"
            value={formData.heroImageUrl || ''}
            onChange={(url) => handleChange('heroImageUrl', url)}
            folder="general"
            recommendedSize="1920 x 1080 px (Landscape)"
            helpText="ပင်မစာမျက်နှာ ထိပ်ဆုံးတွင် ပေါ်မည့် ပင်မနောက်ခံပုံ ဖြစ်ပါသည်"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hero Badge Title (ဓာတ်ပုံပေါ်ရှိ အညွှန်းခေါင်းစဉ်)
              </label>
              <input
                type="text"
                value={formData.heroBadgeTitle || ''}
                onChange={(e) => handleChange('heroBadgeTitle', e.target.value)}
                placeholder="Solution for You"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hero Badge Subtitle (ဓာတ်ပုံပေါ်ရှိ စာတန်းငယ်)
              </label>
              <input
                type="text"
                value={formData.heroBadgeSubtitle || ''}
                onChange={(e) => handleChange('heroBadgeSubtitle', e.target.value)}
                placeholder="မြန်မာမိတ်ဆွေများ အားကိုးစွာ တိုင်ပင်နိုင်သော အကူအညီပေးရေး ဝန်ဆောင်မှု"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. SERVICES SECTION HEADINGS */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-burmese">Services Section (ဝန်ဆောင်မှုများ ကဏ္ဍ ခေါင်းစဉ်)</h3>
            <p className="text-[11px] text-slate-500 font-burmese">Homepage ရှိ ဝန်ဆောင်မှု (၁၂) မျိုး အထက်တွင် ဖော်ပြမည့် ခေါင်းစဉ်</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-burmese text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Services Headline (ခေါင်းစဉ်ကြီး)
            </label>
            <input
              type="text"
              value={formData.servicesHeadline || ''}
              onChange={(e) => handleChange('servicesHeadline', e.target.value)}
              placeholder="ဘာကိစ္စအတွက် ကူညီပေးရမလဲ?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Services Subtext (ခေါင်းစဉ်ငယ် ရှင်းလင်းချက်)
            </label>
            <input
              type="text"
              value={formData.servicesSubtext || ''}
              onChange={(e) => handleChange('servicesSubtext', e.target.value)}
              placeholder="ဗီဇာ၊ စာရွက်စာတမ်း၊ ဘဏ်အကောင့်နှင့် နေထိုင်ရေးဆိုင်ရာ အဓိက ဝန်ဆောင်မှု (၁၂) မျိုး"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 4. CONTACT & SOCIAL CHANNELS */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-burmese">Contact & Social Channels (ဆက်သွယ်ရန် လမ်းကြောင်းများ)</h3>
            <p className="text-[11px] text-slate-500 font-burmese">ဦးစားပေးအစဉ် - 1. Messenger (Primary) · 2. Phone · 3. LINE · 4. Telegram · 5. Email</p>
          </div>
        </div>

        <div className="space-y-4 font-burmese text-xs">
          {/* 1. Messenger (Primary) & 2. Phone (Secondary) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-burmese">
                1. Facebook Messenger Link (Primary Channel)
              </label>
              <input
                type="text"
                value={formData.messengerUrl || ''}
                onChange={(e) => handleChange('messengerUrl', e.target.value)}
                placeholder="https://m.me/solution4u.official"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-burmese">
                2. Phone Number (ဖုန်းနံပါတ်)
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="0693078123"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>
          </div>

          {/* 3. LINE (Third) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-burmese">
                3. LINE ID
              </label>
              <input
                type="text"
                value={formData.lineId || ''}
                onChange={(e) => handleChange('lineId', e.target.value)}
                placeholder="@Sm!t8"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-burmese">
                LINE Official Link (URL)
              </label>
              <input
                type="text"
                value={formData.lineUrl || ''}
                onChange={(e) => handleChange('lineUrl', e.target.value)}
                placeholder="https://line.me/R/ti/p/@Sm!t8"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>
          </div>

          {/* 4. Telegram (Fourth) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-burmese">
                4. Telegram Username (Telegram အကောင့်အမည်)
              </label>
              <input
                type="text"
                value={formData.telegramUsername || ''}
                onChange={(e) => handleChange('telegramUsername', e.target.value)}
                placeholder="@solution4u"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-burmese">
                Telegram Link (URL)
              </label>
              <input
                type="text"
                value={formData.telegramUrl || ''}
                onChange={(e) => handleChange('telegramUrl', e.target.value)}
                placeholder="https://t.me/solution4u"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>
          </div>

          {/* 5. Email (Fifth) & Office Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-burmese">
                5. Email Address (အီးမေးလ်)
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="solutionforyou.contact@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-burmese">
                Office Address (ရုံးခန်း လိပ်စာ)
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Soi Lat Phrao 107, Khlong Chan, Bang Kapi, Bangkok 10240, Thailand."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. SOCIAL / BRAND LINKS & IMAGES */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-burmese">Social & Brand Links (Facebook နှင့် Logo Links)</h3>
            <p className="text-[11px] text-slate-500 font-burmese">တရားဝင် စာမျက်နှာနှင့် Logo ပုံလင့်ခ်များ</p>
          </div>
        </div>

        <div className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-burmese">
              Facebook Page URL
            </label>
            <input
              type="text"
              value={formData.facebookPageUrl || ''}
              onChange={(e) => handleChange('facebookPageUrl', e.target.value)}
              placeholder="https://facebook.com/solution4u.official"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
            />
          </div>

          <ImageUploadField
            label="Logo Image (အမှတ်တံဆိပ် Logo)"
            value={formData.logoUrl || ''}
            onChange={(url) => handleChange('logoUrl', url)}
            folder="general"
            recommendedSize="512 x 512 px (Square PNG/WEBP)"
            helpText="ဝက်ဘ်ဆိုက် Header နှင့် Brand နေရာများတွင် အသုံးပြုမည့် Logo ပုံ ဖြစ်ပါသည်"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUploadField
              label="Facebook Profile Image (ပရိုဖိုင်ပုံ)"
              value={formData.facebookProfileUrl || ''}
              onChange={(url) => handleChange('facebookProfileUrl', url)}
              folder="general"
              recommendedSize="400 x 400 px (Square)"
            />

            <ImageUploadField
              label="Facebook Cover Image (Facebook မျက်နှာဖုံးပုံ)"
              value={formData.facebookCoverUrl || ''}
              onChange={(url) => handleChange('facebookCoverUrl', url)}
              folder="general"
              recommendedSize="1200 x 630 px (Landscape)"
            />
          </div>
        </div>
      </div>

      {/* 6. BUSINESS HOURS */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-burmese">Business Hours (ရုံးဖွင့်ချိန်)</h3>
            <p className="text-[11px] text-slate-500 font-burmese">ရုံးချိန်နှင့် ရုံးပိတ်ရက် ဖော်ပြချက်များ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-burmese text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Business Hours Weekday (ရုံးဖွင့်ရက်)
            </label>
            <input
              type="text"
              value={formData.businessHoursWeekday || ''}
              onChange={(e) => handleChange('businessHoursWeekday', e.target.value)}
              placeholder="တနင်္လာ – သောကြာ: နံနက် ၉:၀၀ မှ ညနေ ၅:၀၀ ထိ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Business Hours Weekend (ရုံးပိတ်ရက်)
            </label>
            <input
              type="text"
              value={formData.businessHoursWeekend || ''}
              onChange={(e) => handleChange('businessHoursWeekend', e.target.value)}
              placeholder="စနေ နှင့် တနင်္ဂနွေ: ရုံးပိတ်ပါသည်။"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 7. LEGAL / DISCLAIMER */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-burmese">Legal Disclaimer (ဥပဒေရေးရာနှင့် ရှင်းလင်းချက်)</h3>
            <p className="text-[11px] text-slate-500 font-burmese">အစိုးရဌာနမဟုတ်ကြောင်း အများပြည်သူသို့ အသိပေးချက်</p>
          </div>
        </div>

        <div className="font-burmese text-xs">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Disclaimer Statement
          </label>
          <textarea
            rows={4}
            value={formData.disclaimer || ''}
            onChange={(e) => handleChange('disclaimer', e.target.value)}
            placeholder="Solution for You သည် ထိုင်းနိုင်ငံရောက် မြန်မာမိတ်ဆွေများအား နေထိုင်ရေးနှင့်..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
          />
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
        {isDirty && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-burmese"
          >
            မူလအတိုင်း ပြန်ထားမည်
          </button>
        )}

        <button
          type="submit"
          disabled={!isDirty || isSaving}
          className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs font-burmese ${
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
              <span>သိမ်းဆည်းမည် (Save Changes)</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

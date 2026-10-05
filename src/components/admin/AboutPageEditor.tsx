import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { siteContentApi } from '../../lib/cms';
import { AboutPageContent } from '../../types';
import { INITIAL_ABOUT_CONTENT } from '../../data/initialData';
import { ImageUploadField } from './ImageUploadField';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  Eye,
  Target,
  HeartHandshake,
  Image as ImageIcon,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Building,
} from 'lucide-react';

export const AboutPageEditor: React.FC = () => {
  const { aboutContent, updateAboutContent, navigateTo } = useApp();

  const [formData, setFormData] = useState<AboutPageContent>({
    ...INITIAL_ABOUT_CONTENT,
    ...aboutContent,
  });
  const [initialBaseline, setInitialBaseline] = useState<AboutPageContent>({
    ...INITIAL_ABOUT_CONTENT,
    ...aboutContent,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Active section view filter: 'all' | 'header' | 'story' | 'vision-mission' | 'cta'
  const [sectionFilter, setSectionFilter] = useState<'all' | 'header' | 'story' | 'vision-mission' | 'cta'>('all');

  // Load freshest content directly from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const fetched = await siteContentApi.getSiteContent<AboutPageContent>(
          'about_page',
          { ...INITIAL_ABOUT_CONTENT, ...aboutContent }
        );
        if (isMounted && fetched) {
          const merged = { ...INITIAL_ABOUT_CONTENT, ...aboutContent, ...fetched };
          setFormData(merged);
          setInitialBaseline(merged);
        }
      } catch (err) {
        console.warn('[AboutPageEditor] Content fetch notice:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  // Track dirty state
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialBaseline);
  }, [formData, initialBaseline]);

  const handleChange = (field: keyof AboutPageContent, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFormData({ ...initialBaseline });
    setValidationError(null);
    setSaveSuccessMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || isSaving) return;

    setValidationError(null);
    setSaveSuccessMsg(null);

    // Validation
    if (!formData.headerTitle?.trim()) {
      setValidationError('Page Header Title (ခေါင်းစဉ်ကြီး) ကို ထည့်သွင်းပေးပါရန် လိုအပ်ပါသည်။');
      return;
    }
    if (!formData.headerSubtitle?.trim()) {
      setValidationError('Page Header Subtitle (ခေါင်းစဉ်ငယ် ရှင်းလင်းချက်) ကို ထည့်သွင်းပေးပါရန် လိုအပ်ပါသည်။');
      return;
    }
    if (!formData.storyParagraph1?.trim()) {
      setValidationError('Story Paragraph 1 (မိတ်ဆက် စာပိုဒ် ၁) ကို ဖြည့်စွက်ပေးပါရန် လိုအပ်ပါသည်။');
      return;
    }
    if (!formData.value1?.trim() || !formData.value2?.trim()) {
      setValidationError('Core Values (အဓိက တန်ဖိုး ၁ နှင့် ၂) ကို ဖြည့်စွက်ပေးပါရန် လိုအပ်ပါသည်။');
      return;
    }
    if (!formData.visionText?.trim()) {
      setValidationError('Vision (အနာဂတ်မျှော်မှန်းချက် စာသား) ကို ဖြည့်စွက်ပေးပါရန် လိုအပ်ပါသည်။');
      return;
    }
    if (!formData.missionText?.trim()) {
      setValidationError('Mission (လုပ်ငန်းရည်မှန်းချက် စာသား) ကို ဖြည့်စွက်ပေးပါရန် လိုအပ်ပါသည်။');
      return;
    }
    if (!formData.ctaTitle?.trim()) {
      setValidationError('CTA Section Title (အောက်ဆုံး ဆက်သွယ်ရန် ခေါင်းစဉ်) ကို ဖြည့်စွက်ပေးပါရန် လိုအပ်ပါသည်။');
      return;
    }

    setIsSaving(true);

    try {
      // 1. Persist to Supabase site_content table
      const success = await siteContentApi.upsertSiteContent('about_page', 'about', formData);
      if (!success) {
        throw new Error('Supabase သို့ သိမ်းဆည်းရာတွင် အဆင်မပြေဖြစ်သွားပါသည်။ ပြန်လည်ကြိုးစားပေးပါ။');
      }

      // 2. Update global AppContext and local caches
      await updateAboutContent(formData);

      // 3. Update baseline
      setInitialBaseline({ ...formData });
      setSaveSuccessMsg('About Us (ကျွန်ုပ်တို့အကြောင်း) အချက်အလက်များကို Supabase ပေါ်သို့ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!');

      setTimeout(() => {
        setSaveSuccessMsg(null);
      }, 4000);
    } catch (err: any) {
      console.error('[AboutPageEditor] Save error:', err);
      setValidationError(err.message || 'သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-left">
      {/* Sticky Top Action Bar */}
      <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 font-burmese">
              About Us Page Editor (ကျွန်ုပ်တို့အကြောင်း စာမျက်နှာ စီမံခြင်း)
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
            Supabase `public.site_content` (key: about_page, section: about) နှင့် တိုက်ရိုက် ချိတ်ဆက်ပြင်ဆင်ခြင်း
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

      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between font-burmese shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-rose-700 hover:text-rose-900 font-bold px-2 py-0.5 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Section Quick Filters */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold text-slate-600 font-burmese overflow-x-auto">
        <button
          type="button"
          onClick={() => setSectionFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
            sectionFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          ကဏ္ဍ အားလုံး ပြသမည်
        </button>

        <button
          type="button"
          onClick={() => setSectionFilter('header')}
          className={`px-3.5 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            sectionFilter === 'header'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>A. Page Header</span>
        </button>

        <button
          type="button"
          onClick={() => setSectionFilter('story')}
          className={`px-3.5 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            sectionFilter === 'story'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>B. Story & Values</span>
        </button>

        <button
          type="button"
          onClick={() => setSectionFilter('vision-mission')}
          className={`px-3.5 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            sectionFilter === 'vision-mission'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>C. Vision & Mission</span>
        </button>

        <button
          type="button"
          onClick={() => setSectionFilter('cta')}
          className={`px-3.5 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            sectionFilter === 'cta'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>D. Call To Action</span>
        </button>
      </div>

      {/* SECTION A: PAGE HEADER */}
      {(sectionFilter === 'all' || sectionFilter === 'header') && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-burmese">
                A. About Page Header (စာမျက်နှာ ထိပ်စီး စာသားများ)
              </h3>
              <p className="text-[11px] text-slate-500 font-burmese">
                About Us စာမျက်နှာ ထိပ်ဆုံးတွင် အသုံးပြုသူများ ပထမဆုံး မြင်တွေ့ရမည့် ခေါင်းစဉ်နှင့် ရှင်းလင်းချက်
              </p>
            </div>
          </div>

          <div className="space-y-4 font-burmese text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Header Kicker (စာတန်းငယ်)
                </label>
                <input
                  type="text"
                  value={formData.headerKicker || ''}
                  onChange={(e) => handleChange('headerKicker', e.target.value)}
                  placeholder="WE ARE A TRUSTED AGENT"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Header Title (ပင်မ ခေါင်းစဉ်ကြီး) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.headerTitle || ''}
                  onChange={(e) => handleChange('headerTitle', e.target.value)}
                  placeholder="ကျွန်ုပ်တို့အကြောင်း"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Header Subtitle (ခေါင်းစဉ်ငယ် ရှင်းလင်းချက်) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={formData.headerSubtitle || ''}
                onChange={(e) => handleChange('headerSubtitle', e.target.value)}
                placeholder="ဘန်ကောက်မှာ ကိုယ့်ဘက်ကနေ ကူညီပေးမယ့် မိတ်ဆွေတစ်ယောက်လို အမြဲရှိနေပေးမည့် Solution for You"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION B: STORY & CORE VALUES */}
      {(sectionFilter === 'all' || sectionFilter === 'story') && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-burmese">
                B. Agency Story & Core Values (မိတ်ဆက် စာပိုဒ်များနှင့် အဓိက တန်ဖိုးများ)
              </h3>
              <p className="text-[11px] text-slate-500 font-burmese">
                လုပ်ငန်းအတွေ့အကြုံ၊ ဝန်ဆောင်မှုပေးသည့် စေတနာနှင့် အဓိက အားသာချက် ၂ ချက်
              </p>
            </div>
          </div>

          <div className="space-y-4 font-burmese text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Story Badge Text (အမှတ်တံဆိပ် စာတန်း)
                </label>
                <input
                  type="text"
                  value={formData.storyBadge || ''}
                  onChange={(e) => handleChange('storyBadge', e.target.value)}
                  placeholder="စိတ်ချယုံကြည်ရသော ဝန်ဆောင်မှု"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Story Section Title (မိတ်ဆက် ခေါင်းစဉ်)
                </label>
                <input
                  type="text"
                  value={formData.storyTitle || ''}
                  onChange={(e) => handleChange('storyTitle', e.target.value)}
                  placeholder="WE ARE A TRUSTED AGENT"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Story Paragraph 1 (မိတ်ဆက် စာပိုဒ် ၁) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={formData.storyParagraph1 || ''}
                onChange={(e) => handleChange('storyParagraph1', e.target.value)}
                placeholder="ဘန်ကောက်မြို့တွင် နေထိုင်အလုပ်လုပ်ကိုင်နေကြသည့် အကိုအမတို့ နေထိုင်စဉ် ကြုံတွေ့ရလေ့ရှိသော..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Story Paragraph 2 (မိတ်ဆက် စာပိုဒ် ၂)
              </label>
              <textarea
                rows={3}
                value={formData.storyParagraph2 || ''}
                onChange={(e) => handleChange('storyParagraph2', e.target.value)}
                placeholder="အကိုအမတို့၏ ခေါင်းခဲစရာ ကိစ္စများကို စေတနာအပြည့်ဖြင့်..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>

            {/* Core Values 1 & 2 */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 mb-3">
                Core Values (အဓိက တန်ဖိုး ၂ ချက်)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    တန်ဖိုး အချက် ၁ (Value 1) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.value1 || ''}
                    onChange={(e) => handleChange('value1', e.target.value)}
                    placeholder="လွယ်ကူ မြန်ဆန် စိတ်ချရမှု"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    တန်ဖိုး အချက် ၂ (Value 2) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.value2 || ''}
                    onChange={(e) => handleChange('value2', e.target.value)}
                    placeholder="မိတ်ဆွေလို ဖော်ရွေနွေးထွေးမှု"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Team Image Upload */}
            <div className="pt-2 border-t border-slate-100">
              <ImageUploadField
                label="Team & Office Image (ရုံးအဖွဲ့နှင့် ဝန်ဆောင်မှု ဓာတ်ပုံ)"
                value={formData.teamImageUrl || ''}
                onChange={(url) => handleChange('teamImageUrl', url)}
                folder="about"
                recommendedSize="1200 x 800 px (Landscape)"
                helpText="About Us စာမျက်နှာ Story အခန်းကဏ္ဍဘေးတွင် ပြသမည့် ဓာတ်ပုံ ဖြစ်ပါသည်"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: VISION & MISSION */}
      {(sectionFilter === 'all' || sectionFilter === 'vision-mission') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vision Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4 font-burmese text-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  OUR VISION (အနာဂတ် မျှော်မှန်းချက်)
                </h3>
                <p className="text-[11px] text-slate-500">
                  အနာဂတ်တွင် ဖြစ်တည်လာစေရန် ဦးတည်ထားသော မျှော်မှန်းချက်
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vision Title (ခေါင်းစဉ်)
              </label>
              <input
                type="text"
                value={formData.visionTitle || ''}
                onChange={(e) => handleChange('visionTitle', e.target.value)}
                placeholder="OUR VISION"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vision Text (မျှော်မှန်းချက် အသေးစိတ် စာသား) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={formData.visionText || ''}
                onChange={(e) => handleChange('visionText', e.target.value)}
                placeholder="ကျွန်ုပ်တို့၏ ကျေးဇူးရှင် မိတ်ဆွေများ၏ အချိန်နဲ့ ငွေကြေး ကုန်ကျစရိတ်ကို အထိရောက်ဆုံး သက်သာစေပြီး..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>
          </div>

          {/* Mission Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4 font-burmese text-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  OUR MISSION (လုပ်ငန်း ရည်မှန်းချက်)
                </h3>
                <p className="text-[11px] text-slate-500">
                  နေ့စဉ် လက်တွေ့အကောင်အထည်ဖော် ဆောင်ရွက်ပေးမည့် တာဝန်
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mission Title (ခေါင်းစဉ်)
              </label>
              <input
                type="text"
                value={formData.missionTitle || ''}
                onChange={(e) => handleChange('missionTitle', e.target.value)}
                placeholder="OUR MISSION"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mission Text (ရည်မှန်းချက် အသေးစိတ် စာသား) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={formData.missionText || ''}
                onChange={(e) => handleChange('missionText', e.target.value)}
                placeholder="ဗီဇာ၊ စာရွက်စာတမ်းနဲ့ အထွေထွေဝန်ဆောင်မှုများကို လွယ်ကူရှင်းလင်းစေရန်၊ အချိန်နှင့် ကုန်ကျစရိတ်ကို အထူးသက်သာစေရန်..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION D: CALL TO ACTION (CTA) */}
      {(sectionFilter === 'all' || sectionFilter === 'cta') && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-burmese">
                D. Call To Action (စာမျက်နှာ အောက်ဆုံး ဆက်သွယ်ရန် ကဏ္ဍ)
              </h3>
              <p className="text-[11px] text-slate-500 font-burmese">
                About Us စာမျက်နှာ အောက်ဆုံးတွင် စိတ်ဝင်စားသူများကို ဖိတ်ခေါ်မည့် ခေါင်းစဉ်နှင့် စာသား
              </p>
            </div>
          </div>

          <div className="space-y-4 font-burmese text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CTA Title (ဖိတ်ခေါ်မှု ခေါင်းစဉ်ကြီး) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.ctaTitle || ''}
                onChange={(e) => handleChange('ctaTitle', e.target.value)}
                placeholder="ဘန်ကောက်ရောက် မြန်မာမိတ်ဆွေများအတွက် အစဉ်အမြဲ အသင့်ရှိနေပါသည်"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CTA Subtitle (ရှင်းလင်းချက် စာတို)
              </label>
              <textarea
                rows={2}
                value={formData.ctaSubtitle || ''}
                onChange={(e) => handleChange('ctaSubtitle', e.target.value)}
                placeholder="မည်သည့်အခက်အခဲမျိုးမဆို ကြိုတင်တိုင်ပင်ဆွေးနွေးနိုင်ပါသည်။ အားမနာဘဲ ဆက်သွယ်လိုက်ပါ။"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={() => navigateTo('about')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 font-burmese"
        >
          <span>Live About Us စာမျက်နှာတွင် ကြည့်ရှုမည်</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-3">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-burmese cursor-pointer"
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
      </div>
    </form>
  );
};

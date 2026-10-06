import React, { useState, useEffect, useMemo } from 'react';
import { useApp, AppRoute } from '../../context/AppContext';
import { LegalPagesContent } from '../../types';
import {
  INITIAL_LEGAL_PAGES_CONTENT,
  parseMarkdownToLegalDoc,
} from '../../pages/LegalPages';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  Shield,
  FileText,
  Scale,
  ExternalLink,
  Eye,
  Edit3,
} from 'lucide-react';

type LegalDocKey = 'privacyPolicy' | 'termsOfService' | 'disclaimer';

export const LegalPagesEditor: React.FC = () => {
  const { legalPagesContent, updateLegalPagesContent, navigateTo } = useApp();

  const [formData, setFormData] = useState<LegalPagesContent>({
    privacyPolicy: {
      ...INITIAL_LEGAL_PAGES_CONTENT.privacyPolicy,
      ...(legalPagesContent?.privacyPolicy || {}),
    },
    termsOfService: {
      ...INITIAL_LEGAL_PAGES_CONTENT.termsOfService,
      ...(legalPagesContent?.termsOfService || {}),
    },
    disclaimer: {
      ...INITIAL_LEGAL_PAGES_CONTENT.disclaimer,
      ...(legalPagesContent?.disclaimer || {}),
    },
  });

  const [initialBaseline, setInitialBaseline] = useState<LegalPagesContent>(formData);
  const [activeDoc, setActiveDoc] = useState<LegalDocKey>('privacyPolicy');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (legalPagesContent) {
      const merged: LegalPagesContent = {
        privacyPolicy: {
          ...INITIAL_LEGAL_PAGES_CONTENT.privacyPolicy,
          ...(legalPagesContent.privacyPolicy || {}),
        },
        termsOfService: {
          ...INITIAL_LEGAL_PAGES_CONTENT.termsOfService,
          ...(legalPagesContent.termsOfService || {}),
        },
        disclaimer: {
          ...INITIAL_LEGAL_PAGES_CONTENT.disclaimer,
          ...(legalPagesContent.disclaimer || {}),
        },
      };
      setFormData(merged);
      setInitialBaseline(merged);
    }
  }, [legalPagesContent]);

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialBaseline);
  }, [formData, initialBaseline]);

  const currentDoc = formData[activeDoc];

  const docMeta: Record<
    LegalDocKey,
    { label: string; burmeseLabel: string; route: AppRoute; icon: React.ReactNode }
  > = {
    privacyPolicy: {
      label: 'Privacy Policy',
      burmeseLabel: 'ကိုယ်ရေးအချက်အလက် မူဝါဒ',
      route: 'privacy-policy',
      icon: <Shield className="w-4 h-4" />,
    },
    termsOfService: {
      label: 'Terms of Service',
      burmeseLabel: 'ဝန်ဆောင်မှု စည်းကမ်းချက်များ',
      route: 'terms-of-service',
      icon: <FileText className="w-4 h-4" />,
    },
    disclaimer: {
      label: 'Disclaimer',
      burmeseLabel: 'တာဝန်ယူမှုဆိုင်ရာ ရှင်းလင်းချက်',
      route: 'disclaimer',
      icon: <Scale className="w-4 h-4" />,
    },
  };

  const parsedPreview = useMemo(() => {
    return parseMarkdownToLegalDoc(currentDoc.content || '');
  }, [currentDoc.content]);

  const handleFieldChange = (field: 'title' | 'content', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [activeDoc]: {
        ...prev[activeDoc],
        [field]: value,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const handleResetUnsaved = () => {
    setFormData(initialBaseline);
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);
  };

  const handleRestoreDefaultCurrentDoc = () => {
    setFormData((prev) => ({
      ...prev,
      [activeDoc]: {
        ...INITIAL_LEGAL_PAGES_CONTENT[activeDoc],
        updatedAt: new Date().toISOString(),
      },
    }));
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    // Validate all three legal pages have non-empty titles and content
    for (const key of ['privacyPolicy', 'termsOfService', 'disclaimer'] as LegalDocKey[]) {
      if (!formData[key].title?.trim() || !formData[key].content?.trim()) {
        setSaveErrorMsg(`${docMeta[key].label} ၏ Title သို့မဟုတ် Content လွတ်နေပါသည်။ စစ်ဆေးပေးပါ။`);
        return;
      }
    }

    setIsSaving(true);
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);

    try {
      await updateLegalPagesContent(formData);
      setInitialBaseline(formData);
      setSaveSuccessMsg(
        'Legal Pages (Privacy Policy, Terms of Service, Disclaimer) ကို Supabase တွင် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။ Public Website တွင် ချက်ချင်း ပြောင်းလဲပြီးဖြစ်ပါသည်။'
      );
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('[LegalPagesEditor] Save error:', err);
      setSaveErrorMsg(err.message || 'သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-burmese text-xs">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold mb-2 font-mono">
              <Scale className="w-3.5 h-3.5" />
              <span>LEGAL PAGES CMS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              Legal Pages (Privacy Policy · Terms of Service · Disclaimer)
            </h2>
            <p className="text-slate-500 text-xs leading-relaxed max-w-2xl mt-1">
              ဤနေရာမှ ပြင်ဆင်သိမ်းဆည်းလိုက်သည်နှင့် Supabase သို့ တိုက်ရိုက်သိမ်းဆည်းပြီး Public Website (#/privacy-policy, #/terms-of-service, #/disclaimer) တွင် Git Push သို့မဟုတ် Redeploy မလိုဘဲ ချက်ချင်း ပြောင်းလဲပါမည်။
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isDirty && (
              <button
                type="button"
                onClick={handleResetUnsaved}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>မသိမ်းရသေးသော ပြင်ဆင်ချက် ပြန်ဖျက်မည်</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Supabase သို့ သိမ်းဆည်းနေသည်...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Legal Pages</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Feedback Banners */}
        {saveSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{saveSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold px-2"
            >
              ✕
            </button>
          </div>
        )}

        {saveErrorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{saveErrorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveErrorMsg(null)}
              className="text-rose-700 hover:text-rose-900 font-bold px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Document Selector Tabs */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(['privacyPolicy', 'termsOfService', 'disclaimer'] as LegalDocKey[]).map((key) => {
              const item = docMeta[key];
              const isSelected = activeDoc === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveDoc(key)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  <span className="text-[11px] opacity-75 font-normal">({item.burmeseLabel})</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateTo(docMeta[activeDoc].route)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sky-700 font-semibold transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Page ကြည့်မည် (#/{docMeta[activeDoc].route})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor / Preview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              {docMeta[activeDoc].icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">
                {docMeta[activeDoc].label}
              </h3>
              <p className="text-[11px] text-slate-500">
                Route: <code className="font-mono text-sky-700">#/{docMeta[activeDoc].route}</code> · Sections detected: <strong>{parsedPreview.sections.length}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'edit'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Content</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Formatted Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleRestoreDefaultCurrentDoc}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold transition-colors cursor-pointer"
              title="Restore initial approved text for this legal document"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>မူလ အတည်ပြုစာသား ပြန်ယူမည်</span>
            </button>
          </div>
        </div>

        {viewMode === 'edit' ? (
          <div className="space-y-5">
            {/* Document Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                စာမျက်နှာ ခေါင်းစဉ် (Page Title)
              </label>
              <input
                type="text"
                required
                value={currentDoc.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g. Privacy Policy"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-sm font-sans font-semibold text-slate-900"
              />
            </div>

            {/* Formatting helper box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1 font-sans">
              <div className="font-semibold text-slate-800">
                Formatting Guide (စာပိုဒ်နှင့် ခေါင်းစဉ်ခွဲများ ရေးသားပုံ):
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-slate-600">
                <span>
                  <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">## 1. Section Heading</code> → Section Title
                </span>
                <span>
                  <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">* Item</code> → Bullet List
                </span>
                <span>
                  <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">1. Item</code> → Numbered List
                </span>
                <span>Blank line between lines → New Paragraph</span>
              </div>
            </div>

            {/* Full Legal Document Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                စာသား အပြည့်အစုံ (Full Legal Document Content)
              </label>
              <textarea
                rows={26}
                required
                value={currentDoc.content}
                onChange={(e) => handleFieldChange('content', e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-sm font-sans leading-relaxed text-slate-800"
              />
            </div>
          </div>
        ) : (
          /* Formatted Live Preview */
          <div className="bg-slate-50/70 rounded-2xl p-6 sm:p-10 border border-slate-200/80 font-sans">
            <header className="pb-6 mb-8 border-b border-slate-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {currentDoc.title}
              </h1>
              {parsedPreview.introParagraphs.length > 0 && (
                <div className="mt-4 space-y-3.5 text-sm sm:text-base text-slate-700 leading-relaxed">
                  {parsedPreview.introParagraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              )}
            </header>

            <div className="space-y-8">
              {parsedPreview.sections.map((sec, idx) => (
                <section key={idx} className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900">{sec.heading}</h2>
                  <div className="space-y-3 text-sm sm:text-base text-slate-700 leading-relaxed">
                    {sec.blocks.map((block, bIdx) => {
                      if (block.type === 'p') {
                        return <p key={bIdx}>{block.text}</p>;
                      }
                      if (block.type === 'ul') {
                        return (
                          <ul key={bIdx} className="list-disc pl-6 space-y-1.5 marker:text-sky-600">
                            {block.items.map((item, iIdx) => (
                              <li key={iIdx}>{item}</li>
                            ))}
                          </ul>
                        );
                      }
                      if (block.type === 'ol') {
                        return (
                          <ol
                            key={bIdx}
                            className="list-decimal pl-6 space-y-1.5 marker:text-sky-700 marker:font-semibold"
                          >
                            {block.items.map((item, iIdx) => (
                              <li key={iIdx}>{item}</li>
                            ))}
                          </ol>
                        );
                      }
                      return null;
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            {isDirty
              ? '⚠️ မသိမ်းရသေးသော ပြင်ဆင်ချက်များ ရှိနေပါသည်'
              : '✓ လက်ရှိစာသားများသည် Supabase နှင့် ထပ်တူဖြစ်နေပါသည်'}
          </span>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>သိမ်းဆည်းနေပါသည်...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Legal Pages</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

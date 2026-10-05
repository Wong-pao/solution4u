import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { siteContentApi } from '../../lib/cms';
import { TrustPillarsContent, WorkflowStepsContent } from '../../types';
import {
  INITIAL_TRUST_PILLARS,
  INITIAL_WORKFLOW_STEPS,
} from '../../data/initialData';
import { TrustPillarsEditor } from './TrustPillarsEditor';
import { WorkflowStepsEditor } from './WorkflowStepsEditor';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  RotateCcw,
  Loader2,
  Info,
  ExternalLink,
} from 'lucide-react';

export const HomePageEditor: React.FC = () => {
  const {
    trustPillarsContent,
    workflowStepsContent,
    updateTrustPillars,
    updateWorkflowSteps,
    navigateTo,
  } = useApp();

  const [trustData, setTrustData] = useState<TrustPillarsContent>({
    ...INITIAL_TRUST_PILLARS,
    ...trustPillarsContent,
  });
  const [initialTrustBaseline, setInitialTrustBaseline] = useState<TrustPillarsContent>({
    ...INITIAL_TRUST_PILLARS,
    ...trustPillarsContent,
  });

  const [workflowData, setWorkflowData] = useState<WorkflowStepsContent>({
    ...INITIAL_WORKFLOW_STEPS,
    ...workflowStepsContent,
  });
  const [initialWorkflowBaseline, setInitialWorkflowBaseline] = useState<WorkflowStepsContent>({
    ...INITIAL_WORKFLOW_STEPS,
    ...workflowStepsContent,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Active view section filter: 'all' | 'trust' | 'workflow'
  const [sectionFilter, setSectionFilter] = useState<'all' | 'trust' | 'workflow'>('all');

  // Load freshest content directly from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const [fetchedTrust, fetchedWorkflow] = await Promise.all([
          siteContentApi.getSiteContent<TrustPillarsContent>(
            'home_trust_pillars',
            { ...INITIAL_TRUST_PILLARS, ...trustPillarsContent }
          ),
          siteContentApi.getSiteContent<WorkflowStepsContent>(
            'home_workflow_steps',
            { ...INITIAL_WORKFLOW_STEPS, ...workflowStepsContent }
          ),
        ]);

        if (isMounted) {
          if (fetchedTrust) {
            const mergedTrust = { ...INITIAL_TRUST_PILLARS, ...trustPillarsContent, ...fetchedTrust };
            setTrustData(mergedTrust);
            setInitialTrustBaseline(mergedTrust);
          }
          if (fetchedWorkflow) {
            const mergedWorkflow = { ...INITIAL_WORKFLOW_STEPS, ...workflowStepsContent, ...fetchedWorkflow };
            setWorkflowData(mergedWorkflow);
            setInitialWorkflowBaseline(mergedWorkflow);
          }
        }
      } catch (err) {
        console.warn('[HomePageEditor] Content fetch warning:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  // Track dirty state (unsaved changes in either Trust Pillars or Workflow Steps)
  const isDirty = useMemo(() => {
    const isTrustDirty = JSON.stringify(trustData) !== JSON.stringify(initialTrustBaseline);
    const isWorkflowDirty = JSON.stringify(workflowData) !== JSON.stringify(initialWorkflowBaseline);
    return isTrustDirty || isWorkflowDirty;
  }, [trustData, initialTrustBaseline, workflowData, initialWorkflowBaseline]);

  const handleReset = () => {
    setTrustData({ ...initialTrustBaseline });
    setWorkflowData({ ...initialWorkflowBaseline });
    setValidationError(null);
    setSaveSuccessMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || isSaving) return;

    setValidationError(null);
    setSaveSuccessMsg(null);

    // 1. Validation - Trust Pillars
    if (!trustData.sectionTitle?.trim()) {
      setValidationError('Trust Pillars ပင်မ ခေါင်းစဉ် (Section Title) ကို ထည့်သွင်းပေးပါရန် လိုအပ်ပါသည်။');
      return;
    }
    const pillars = trustData.pillars || [];
    for (let i = 0; i < pillars.length; i++) {
      const p = pillars[i];
      if (!p.title?.trim()) {
        setValidationError(`Trust Pillar အမှတ် #${i + 1} ၏ ခေါင်းစဉ် (Title) ကို ဖြည့်စွက်ပေးပါ။`);
        return;
      }
      if (!p.desc?.trim()) {
        setValidationError(`Trust Pillar အမှတ် #${i + 1} ၏ ရှင်းလင်းချက် စာသား (Description) ကို ဖြည့်စွက်ပေးပါ။`);
        return;
      }
    }

    // 2. Validation - Workflow Steps
    if (!workflowData.sectionTitle?.trim()) {
      setValidationError('Workflow ပင်မ ခေါင်းစဉ် (Section Title) ကို ထည့်သွင်းပေးပါရန် လိုအပ်ပါသည်။');
      return;
    }
    const steps = workflowData.steps || [];
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      if (!s.title?.trim()) {
        setValidationError(`Workflow လုပ်ငန်းစဉ် အဆင့် #${i + 1} ၏ ခေါင်းစဉ် (Title) ကို ဖြည့်စွက်ပေးပါ။`);
        return;
      }
      if (!s.desc?.trim()) {
        setValidationError(`Workflow လုပ်ငန်းစဉ် အဆင့် #${i + 1} ၏ ရှင်းလင်းချက် စာသား (Description) ကို ဖြည့်စွက်ပေးပါ။`);
        return;
      }
    }

    setIsSaving(true);

    try {
      // 3. Persist to Supabase site_content table
      const [trustSuccess, workflowSuccess] = await Promise.all([
        siteContentApi.upsertSiteContent('home_trust_pillars', 'home', trustData),
        siteContentApi.upsertSiteContent('home_workflow_steps', 'home', workflowData),
      ]);

      if (!trustSuccess || !workflowSuccess) {
        throw new Error('Supabase သို့ သိမ်းဆည်းရာတွင် အဆင်မပြေဖြစ်သွားပါသည်။ ပြန်လည်ကြိုးစားပေးပါ။');
      }

      // 4. Update global AppContext and local caches
      await Promise.all([
        updateTrustPillars(trustData),
        updateWorkflowSteps(workflowData),
      ]);

      // 5. Update baselines
      setInitialTrustBaseline({ ...trustData });
      setInitialWorkflowBaseline({ ...workflowData });
      setSaveSuccessMsg('Home Page (Trust Pillars နှင့် Simple Workflow) အချက်အလက်များကို Supabase ပေါ်သို့ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!');

      setTimeout(() => {
        setSaveSuccessMsg(null);
      }, 4000);
    } catch (err: any) {
      console.error('[HomePageEditor] Save error:', err);
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
              Home Page Sections Editor (မူလစာမျက်နှာ ကဏ္ဍများ စီမံခြင်း)
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
            Supabase `public.site_content` (keys: home_trust_pillars, home_workflow_steps) နှင့် တိုက်ရိုက် ချိတ်ဆက်ပြင်ဆင်ခြင်း
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

      {/* Info Callout explaining Global Settings vs Home Sections */}
      <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 border border-sky-200/80 text-xs text-sky-900 space-y-2 font-burmese">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sky-950">
              Hero Section နှင့် ဝန်ဆောင်မှု ခေါင်းစဉ်များ ပြင်ဆင်ရန် အသိပေးချက်:
            </p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              မူလစာမျက်နှာ (Homepage) ထိပ်ဆုံးရှိ <b>Hero Headline၊ Supporting Text၊ Trust Statement၊ Emotional Quote၊ Hero Banner ဓာတ်ပုံ</b> နှင့် <b>Services Section ခေါင်းစဉ်ကြီးများ</b> ကို <b>"၆။ Global Settings"</b> တွင်လည်းကောင်း၊ <b>Knowledge Center၊ Facebook Update၊ Brand Profile နှင့် Emotional CTA</b> စာသားများကို <b>"၇။ Static Page Content"</b> တွင်လည်းကောင်း စီမံနိုင်ပါသည်။ ဤ Tab တွင် Homepage သီးသန့်ဖြစ်သော <b>Trust Pillars (Why Us ၅ ချက်)</b> နှင့် <b>Simple Workflow (လုပ်ငန်းစဉ် ၅ ဆင့်)</b> တို့ကို အသေးစိတ် ပြင်ဆင်နိုင်ပါသည်။
            </p>
          </div>
        </div>
      </div>

      {/* Sub-tab Section Filter Buttons */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold text-slate-600 font-burmese">
        <button
          type="button"
          onClick={() => setSectionFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl transition-colors ${
            sectionFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          ကဏ္ဍ အားလုံး ပြသမည်
        </button>

        <button
          type="button"
          onClick={() => setSectionFilter('trust')}
          className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
            sectionFilter === 'trust'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>A. Trust Pillars (ကတိကဝတ် ၅ ချက်)</span>
        </button>

        <button
          type="button"
          onClick={() => setSectionFilter('workflow')}
          className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
            sectionFilter === 'workflow'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>B. Simple Workflow (လုပ်ငန်းစဉ် ၅ ဆင့်)</span>
        </button>
      </div>

      {/* Section A: Trust Pillars Editor */}
      {(sectionFilter === 'all' || sectionFilter === 'trust') && (
        <TrustPillarsEditor
          data={trustData}
          onChange={(updated) => setTrustData(updated)}
        />
      )}

      {/* Section B: Simple Workflow Editor */}
      {(sectionFilter === 'all' || sectionFilter === 'workflow') && (
        <WorkflowStepsEditor
          data={workflowData}
          onChange={(updated) => setWorkflowData(updated)}
        />
      )}

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 font-burmese"
        >
          <span>Live Homepage တွင် ကြည့်ရှုမည်</span>
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

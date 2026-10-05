import React from 'react';
import { WorkflowStepsContent } from '../../types';
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  PhoneCall,
  MessageSquare,
  FileCheck,
  CheckCircle,
  Clock,
  Send,
  Zap,
} from 'lucide-react';

export const WORKFLOW_ICON_OPTIONS: Array<{
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'PhoneCall', label: 'Phone (ဆက်သွယ်ရန်)', Icon: PhoneCall },
  { id: 'MessageSquare', label: 'Message (လိုအပ်ချက်)', Icon: MessageSquare },
  { id: 'FileCheck', label: 'Check (စစ်ဆေးခြင်း)', Icon: FileCheck },
  { id: 'Zap', label: 'Action (စတင်ဆောင်ရွက်ခြင်း)', Icon: Zap },
  { id: 'CheckCircle', label: 'Complete (ပြီးဆုံးသည်အထိ)', Icon: CheckCircle },
  { id: 'Clock', label: 'Clock (အချိန်နှင့်တပြေးညီ)', Icon: Clock },
  { id: 'Send', label: 'Send (ပေးပို့ခြင်း)', Icon: Send },
];

interface WorkflowStepsEditorProps {
  data: WorkflowStepsContent;
  onChange: (updated: WorkflowStepsContent) => void;
}

export const WorkflowStepsEditor: React.FC<WorkflowStepsEditorProps> = ({
  data,
  onChange,
}) => {
  const steps = data.steps || [];

  const handleKickerChange = (val: string) => {
    onChange({ ...data, sectionKicker: val });
  };

  const handleTitleChange = (val: string) => {
    onChange({ ...data, sectionTitle: val });
  };

  const handleSubtitleChange = (val: string) => {
    onChange({ ...data, sectionSubtitle: val });
  };

  const handleStepChange = (
    index: number,
    field: 'num' | 'title' | 'desc' | 'icon',
    value: string
  ) => {
    const updated = [...steps];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange({ ...data, steps: updated });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...steps];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange({ ...data, steps: updated });
  };

  const handleMoveDown = (index: number) => {
    if (index === steps.length - 1) return;
    const updated = [...steps];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange({ ...data, steps: updated });
  };

  const handleAddStep = () => {
    const nextNum = String(steps.length + 1).padStart(2, '0');
    const newStep = {
      num: nextNum,
      title: '',
      desc: '',
    };
    onChange({ ...data, steps: [...steps, newStep] });
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    const updated = steps.filter((_, i) => i !== index);
    onChange({ ...data, steps: updated });
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
      {/* Section Header Info */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-burmese">
            B. Simple Workflow (လုပ်ငန်းစဉ် အဆင့်ဆင့်)
          </h3>
          <p className="text-[11px] text-slate-500 font-burmese">
            Homepage တွင် ဖော်ပြထားသော ဝန်ဆောင်မှု ရယူရာတွင် လိုက်နာရမည့် အဆင့်ဆင့် လုပ်ငန်းစဉ်
          </p>
        </div>
      </div>

      {/* Section Headings Form */}
      <div className="space-y-4 font-burmese text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Section Kicker (စာတန်းငယ်)
            </label>
            <input
              type="text"
              value={data.sectionKicker || ''}
              onChange={(e) => handleKickerChange(e.target.value)}
              placeholder="SIMPLE WORKFLOW"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Section Title (ပင်မ ခေါင်းစဉ်ကြီး) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={data.sectionTitle || ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="လုပ်ငန်းစဉ် ၅ ဆင့်"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Section Subtitle (ခေါင်းစဉ်ငယ် ရှင်းလင်းချက်)
          </label>
          <input
            type="text"
            value={data.sectionSubtitle || ''}
            onChange={(e) => handleSubtitleChange(e.target.value)}
            placeholder="ရှုပ်ထွေးမှုမရှိဘဲ ရိုးရှင်းလွယ်ကူစွာဖြင့် သင်လိုအပ်သော ဝန်ဆောင်မှုကို ရယူလိုက်ပါ"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 font-burmese uppercase tracking-wider">
            Steps List (လုပ်ငန်းစဉ် အဆင့်များ - {steps.length} ဆင့်)
          </h4>
          <button
            type="button"
            onClick={handleAddStep}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition-colors font-burmese cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>အဆင့်အသစ် ထည့်မည်</span>
          </button>
        </div>

        <div className="space-y-3.5">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3 transition-colors hover:border-slate-300"
            >
              {/* Row Header with Reorder and Delete controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                    {step.num || String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-bold text-slate-700 font-burmese">
                    အဆင့် #{idx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveUp(idx)}
                    title="အပေါ်သို့ ရွှေ့မည်"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={idx === steps.length - 1}
                    onClick={() => handleMoveDown(idx)}
                    title="အောက်သို့ ရွှေ့မည်"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={steps.length <= 1}
                    onClick={() => handleRemoveStep(idx)}
                    title="ဖျက်ပစ်မည်"
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Form inputs for this step */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 font-burmese text-xs">
                {/* Number */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    စဉ် (Num)
                  </label>
                  <input
                    type="text"
                    value={step.num || ''}
                    onChange={(e) => handleStepChange(idx, 'num', e.target.value)}
                    placeholder="01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                  />
                </div>

                {/* Title */}
                <div className="sm:col-span-10">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    အဆင့် ခေါင်းစဉ် (Title) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={step.title || ''}
                    onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                    placeholder="ဥပမာ - ဆက်သွယ်ပါ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-12">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ရှင်းလင်းချက် စာသား (Description) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={step.desc || ''}
                    onChange={(e) => handleStepChange(idx, 'desc', e.target.value)}
                    placeholder="အဆင့်နှင့် သက်ဆိုင်သော ရှင်းလင်းချက် ရေးပါ..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

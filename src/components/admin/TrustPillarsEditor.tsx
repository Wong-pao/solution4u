import React from 'react';
import { TrustPillarsContent } from '../../types';
import {
  ShieldCheck,
  Sparkles,
  FileText,
  Clock,
  Heart,
  CheckCircle2,
  UserCheck,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
} from 'lucide-react';

export const TRUST_ICON_OPTIONS: Array<{
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'ShieldCheck', label: 'Shield (တာဝန်ယူမှု)', Icon: ShieldCheck },
  { id: 'Sparkles', label: 'Sparkles (အကြံဉာဏ်)', Icon: Sparkles },
  { id: 'FileText', label: 'Document (စာရွက်စာတမ်း)', Icon: FileText },
  { id: 'Clock', label: 'Clock (မြန်ဆန်မှု)', Icon: Clock },
  { id: 'Heart', label: 'Heart (နွေးထွေးမှု)', Icon: Heart },
  { id: 'CheckCircle2', label: 'Check (တိကျမှု)', Icon: CheckCircle2 },
  { id: 'UserCheck', label: 'User (မိတ်ဆွေ)', Icon: UserCheck },
];

interface TrustPillarsEditorProps {
  data: TrustPillarsContent;
  onChange: (updated: TrustPillarsContent) => void;
}

export const TrustPillarsEditor: React.FC<TrustPillarsEditorProps> = ({
  data,
  onChange,
}) => {
  const pillars = data.pillars || [];

  const handleKickerChange = (val: string) => {
    onChange({ ...data, sectionKicker: val });
  };

  const handleTitleChange = (val: string) => {
    onChange({ ...data, sectionTitle: val });
  };

  const handleSubtitleChange = (val: string) => {
    onChange({ ...data, sectionSubtitle: val });
  };

  const handlePillarChange = (
    index: number,
    field: 'num' | 'title' | 'desc' | 'icon',
    value: string
  ) => {
    const updated = [...pillars];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange({ ...data, pillars: updated });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...pillars];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange({ ...data, pillars: updated });
  };

  const handleMoveDown = (index: number) => {
    if (index === pillars.length - 1) return;
    const updated = [...pillars];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange({ ...data, pillars: updated });
  };

  const handleAddPillar = () => {
    const nextNum = String(pillars.length + 1).padStart(2, '0');
    const newPillar = {
      num: nextNum,
      title: '',
      desc: '',
      icon: 'ShieldCheck',
    };
    onChange({ ...data, pillars: [...pillars, newPillar] });
  };

  const handleRemovePillar = (index: number) => {
    if (pillars.length <= 1) return;
    const updated = pillars.filter((_, i) => i !== index);
    onChange({ ...data, pillars: updated });
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
      {/* Section Header Info */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
        <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-burmese">
            A. Trust Pillars / Our Promise (ကျွန်ုပ်တို့၏ ကတိကဝတ် ၅ ချက်)
          </h3>
          <p className="text-[11px] text-slate-500 font-burmese">
            Homepage အလယ်တွင် ဖော်ပြထားသော Solution for You ကို ဘာကြောင့် ရွေးချယ်သင့်သလဲ အချက်များ
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
              placeholder="OUR PROMISE"
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
              placeholder="Solution for You ကို ဘာကြောင့် ရွေးချယ်ကြတာလဲ?"
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
            placeholder="ခေါင်းခဲစရာ ကိစ္စများကို စေတနာအပြည့်ဖြင့် အမှန်ကန်ဆုံးနှင့် အမြန်ဆန်ဆုံး ကူညီဖြေရှင်းပေးပါသည်"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
          />
        </div>
      </div>

      {/* Pillars List */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 font-burmese uppercase tracking-wider">
            Pillars List (အချက်များ စာရင်း - {pillars.length} ခု)
          </h4>
          <button
            type="button"
            onClick={handleAddPillar}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold transition-colors font-burmese cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>အသစ်ထည့်မည်</span>
          </button>
        </div>

        <div className="space-y-3.5">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3 transition-colors hover:border-slate-300"
            >
              {/* Row Header with Reorder and Delete controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                    {pillar.num || String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-bold text-slate-700 font-burmese">
                    အချက် #{idx + 1}
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
                    disabled={idx === pillars.length - 1}
                    onClick={() => handleMoveDown(idx)}
                    title="အောက်သို့ ရွှေ့မည်"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={pillars.length <= 1}
                    onClick={() => handleRemovePillar(idx)}
                    title="ဖျက်ပစ်မည်"
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Form inputs for this pillar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 font-burmese text-xs">
                {/* Number */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    စဉ် (Num)
                  </label>
                  <input
                    type="text"
                    value={pillar.num || ''}
                    onChange={(e) => handlePillarChange(idx, 'num', e.target.value)}
                    placeholder="01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                  />
                </div>

                {/* Title */}
                <div className="sm:col-span-6">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ခေါင်းစဉ် (Title) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pillar.title || ''}
                    onChange={(e) => handlePillarChange(idx, 'title', e.target.value)}
                    placeholder="ဥပမာ - အစအဆုံး တာဝန်ယူပေးခြင်း"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                  />
                </div>

                {/* Icon Selector */}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    အိုင်ကွန် (Icon)
                  </label>
                  <select
                    value={pillar.icon || 'ShieldCheck'}
                    onChange={(e) => handlePillarChange(idx, 'icon', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden bg-white"
                  >
                    {TRUST_ICON_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="sm:col-span-12">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ရှင်းလင်းချက် စာသား (Description) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={pillar.desc || ''}
                    onChange={(e) => handlePillarChange(idx, 'desc', e.target.value)}
                    placeholder="ဖော်ပြချက် စာသား ရေးပါ..."
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

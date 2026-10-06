import React from 'react';
import { useApp } from '../context/AppContext';
import { getTelegramUrl } from '../data/initialData';
import { ServiceIcon } from '../components/ServiceIcon';
import { ArrowLeft, MessageSquare, Phone, CheckCircle2, ShieldAlert, ArrowRight, HelpCircle, Send } from 'lucide-react';

export const ServiceDetailPage: React.FC = () => {
  const { currentSlug, services, navigateTo, openConsultModal, settings, staticPageContent } = useApp();

  const service = currentSlug
    ? services.find(
        (s) =>
          (s.slug === currentSlug ||
            s.id === currentSlug ||
            (currentSlug === 'hospital-clinic-interpreter' && s.slug === 'medical-interpreter') ||
            (currentSlug === 'room-condo' && s.slug === 'condo-rental') ||
            (currentSlug === 'work-documents' && s.slug === 'resignation-letter') ||
            (currentSlug === 'document-check' && s.slug === 'document-audit') ||
            (currentSlug === 'legal-job-placement' && s.slug === 'job-placement')) &&
          s.isActive
      )
    : services.find((s) => s.isActive);
  const relatedServices = services.filter((s) => s.id !== service?.id && s.isActive).slice(0, 3);

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-burmese space-y-4">
        <h2 className="text-xl font-bold text-slate-800">ဝန်ဆောင်မှုကို ရှာမတွေ့ပါ</h2>
        <button
          onClick={() => navigateTo('services')}
          className="text-sm font-semibold text-sky-600 hover:underline"
        >
          ဝန်ဆောင်မှုအားလုံးသို့ ပြန်သွားရန်
        </button>
      </div>
    );
  }

  const primaryCtaLabel =
    staticPageContent?.serviceDetailPrimaryBtn &&
    !staticPageContent.serviceDetailPrimaryBtn.includes('Telegram') &&
    !staticPageContent.serviceDetailPrimaryBtn.includes('WhatsApp')
      ? staticPageContent.serviceDetailPrimaryBtn
      : 'Messenger မှ တိုက်ရိုက်မေးမြန်းရန်';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigateTo('services')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors font-burmese"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ဝန်ဆောင်မှုများအားလုံးသို့ ပြန်သွားရန်</span>
        </button>
      </div>

      {/* Main Service Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
        {/* Service Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
              <ServiceIcon name={service.iconName} className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-semibold text-sky-700 font-mono uppercase tracking-wider">
                SERVICE #{service.order.toString().padStart(2, '0')}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-burmese leading-tight mt-0.5">
                {service.title}
              </h1>
            </div>
          </div>

          <button
            onClick={() => openConsultModal(service.title)}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold font-burmese transition-colors shadow-xs"
          >
            အခမဲ့ တိုင်ပင်ရန်
          </button>
        </div>

        {/* Optional Cover Image if uploaded */}
        {service.coverImage && (
          <div className="w-full rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-50 shadow-2xs flex items-center justify-center">
            <img
              src={service.coverImage}
              alt={service.title}
              className="w-auto max-w-full max-h-[400px] h-auto object-contain mx-auto block"
              onError={(e) => {
                const container = e.currentTarget.parentElement;
                if (container) {
                  container.style.display = 'none';
                }
              }}
            />
          </div>
        )}

        {/* Short Summary Highlight */}
        <div className="p-5 sm:p-6 bg-sky-50/70 rounded-2xl border border-sky-100 font-burmese">
          <p className="text-sm sm:text-base text-sky-900 font-medium leading-[1.85]">
            {service.shortDescription}
          </p>
        </div>

        {/* Detailed Explanation */}
        <div className="space-y-4 font-burmese text-slate-700">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">ဝန်ဆောင်မှု အသေးစိတ် ရှင်းလင်းချက်</h2>
          <p className="text-sm sm:text-base leading-[1.85] whitespace-pre-line">{service.detailedDescription}</p>
        </div>

        {/* What Solution for You Handles */}
        <div className="space-y-4 font-burmese">
          <h3 className="text-base font-bold text-slate-900">
            {staticPageContent?.serviceDetailSupportHeading || "ကျွန်ုပ်တို့ အစအဆုံး ကူညီပေးမည့် အချက်များ"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{staticPageContent?.serviceDetailSupportBullet1 || "လိုအပ်သော စာရွက်စာတမ်းများ ကြိုတင်စစ်ဆေးပေးခြင်း"}</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{staticPageContent?.serviceDetailSupportBullet2 || "ဘာသာစကားနှင့် ဆက်သွယ်ရေး အခက်အခဲမရှိအောင် ကူညီခြင်း"}</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{staticPageContent?.serviceDetailSupportBullet3 || "ရက်ချိန်းနှင့် တရားဝင် လုပ်ထုံးလုပ်နည်းများ စီစဉ်ပေးခြင်း"}</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{staticPageContent?.serviceDetailSupportBullet4 || "လုပ်ငန်းစဉ် အောင်မြင်သည်အထိ အနီးကပ် တွဲခေါ်ဆောင်ရွက်ပေးခြင်း"}</span>
            </div>
          </div>
        </div>

        {/* Legal Advisory / Non-Government notice */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 leading-relaxed font-burmese flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            {staticPageContent?.serviceDetailNoticeDisclaimer || "သတိပြုရန် - Solution for You သည် ပုဂ္ဂလိက ဝန်ဆောင်မှု အကူအညီပေးရေး လုပ်ငန်းဖြစ်ပြီး အစိုးရရုံးဌာန မဟုတ်ပါ။ ဥပဒေမဲ့ ကတိကဝတ်များ မပေးဘဲ တည်ဆဲစည်းမျဉ်းများနှင့်အညီ အမှန်ကန်ဆုံး ကူညီပေးခြင်း ဖြစ်ပါသည်။"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-burmese">
          <a
            href={settings.messengerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{primaryCtaLabel}</span>
          </a>

          <a
            href={`tel:${settings.phone}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>
              {staticPageContent?.serviceDetailSecondaryBtn || 'ဖုန်းတိုက်ရိုက်ခေါ်ဆိုရန်'} ({settings.phone})
            </span>
          </a>

          <button
            type="button"
            onClick={() => openConsultModal(service.title)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
          >
            <span>{staticPageContent?.serviceDetailTertiaryBtn || 'အခမဲ့ တိုင်ပင်လွှာ ပို့ရန်'}</span>
          </button>
        </div>
      </div>

      {/* Related Services */}
      <div className="space-y-5">
        <h3 className="text-lg font-bold text-slate-900 font-burmese">အခြား ဆက်စပ်ဝန်ဆောင်မှုများ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {relatedServices.map((rel) => (
            <div
              key={rel.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigateTo('service-detail', rel.slug);
                }
              }}
              onClick={() => navigateTo('service-detail', rel.slug)}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between focus:ring-2 focus:ring-sky-500 outline-hidden group"
            >
              <div className="space-y-3">
                {/* 1. Header: Icon + Title */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                    <ServiceIcon name={rel.iconName} className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors font-burmese leading-snug line-clamp-2">
                    {rel.title}
                  </h4>
                </div>

                {/* 2. Service Image with Short Summary subtle overlay (or clean fallback if no image) */}
                {rel.coverImage ? (
                  <div className="w-full aspect-[16/10] rounded-xl overflow-hidden relative border border-slate-200/80 bg-slate-900 shadow-2xs group/img">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover/img:scale-103 transition-transform duration-300"
                      onError={(e) => {
                        const container = e.currentTarget.parentElement;
                        if (container) container.style.display = 'none';
                      }}
                    />
                    {/* Subtle soft gradient base behind the floating panel */}
                    <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none" />

                    {/* Premium Floating Glass Summary Panel - Short Summary ONLY */}
                    <div className="absolute inset-x-2 bottom-2 sm:inset-x-2.5 sm:bottom-2.5 p-2 sm:p-2.5 rounded-xl bg-[#0c2340]/35 backdrop-blur-sm border border-white/20 shadow-xs shadow-slate-950/15 pointer-events-none">
                      <p className="text-[11px] sm:text-xs text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] font-medium leading-relaxed font-burmese line-clamp-2">
                        {rel.shortDescription}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Fallback when no image is uploaded */
                  <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 shadow-2xs">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed font-burmese line-clamp-2">
                      {rel.shortDescription}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 mt-2 border-t border-slate-100 text-xs font-semibold text-sky-700 font-burmese flex items-center gap-1">
                <span>အသေးစိတ်</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

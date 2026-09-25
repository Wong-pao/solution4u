import React from 'react';
import { useApp } from '../context/AppContext';
import { ServiceIcon } from '../components/ServiceIcon';
import { ArrowLeft, MessageSquare, Phone, CheckCircle2, ShieldAlert, ArrowRight, HelpCircle } from 'lucide-react';

export const ServiceDetailPage: React.FC = () => {
  const { currentSlug, services, navigateTo, openConsultModal, settings } = useApp();

  const service = services.find((s) => s.slug === currentSlug) || services[0];
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

  const handleWhatsAppConsult = () => {
    const text = encodeURIComponent(
      `မင်္ဂလာပါ Solution for You။ "${service.title}" ဝန်ဆောင်မှုနဲ့ ပတ်သက်ပြီး စုံစမ်းမေးမြန်းလိုပါသည် ခင်ဗျာ။`
    );
    window.open(`${settings.whatsappUrl}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
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

        {/* Short Summary Highlight */}
        <div className="p-5 bg-sky-50/70 rounded-2xl border border-sky-100 font-burmese">
          <p className="text-sm sm:text-base text-sky-900 font-medium leading-relaxed">
            {service.shortDescription}
          </p>
        </div>

        {/* Detailed Explanation */}
        <div className="space-y-4 font-burmese text-slate-700 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">ဝန်ဆောင်မှု အသေးစိတ် ရှင်းလင်းချက်</h2>
          <p className="text-sm sm:text-base">{service.detailedDescription}</p>
        </div>

        {/* What Solution for You Handles */}
        <div className="space-y-4 font-burmese">
          <h3 className="text-base font-bold text-slate-900">ကျွန်ုပ်တို့ အစအဆုံး ကူညီပေးမည့် အချက်များ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>လိုအပ်သော စာရွက်စာတမ်းများ ကြိုတင်စစ်ဆေးပေးခြင်း</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>ဘာသာစကားနှင့် ဆက်သွယ်ရေး အခက်အခဲမရှိအောင် ကူညီခြင်း</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>ရက်ချိန်းနှင့် တရားဝင် လုပ်ထုံးလုပ်နည်းများ စီစဉ်ပေးခြင်း</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>လုပ်ငန်းစဉ် အောင်မြင်သည်အထိ အနီးကပ် တွဲခေါ်ဆောင်ရွက်ပေးခြင်း</span>
            </div>
          </div>
        </div>

        {/* Legal Advisory / Non-Government notice */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 leading-relaxed font-burmese flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            သတိပြုရန် - Solution for You သည် ပုဂ္ဂလိက ဝန်ဆောင်မှု အကူအညီပေးရေး လုပ်ငန်းဖြစ်ပြီး အစိုးရရုံးဌာန မဟုတ်ပါ။ ဥပဒေမဲ့ ကတိကဝတ်များ မပေးဘဲ တည်ဆဲစည်းမျဉ်းများနှင့်အညီ အမှန်ကန်ဆုံး ကူညီပေးခြင်း ဖြစ်ပါသည်။
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-burmese">
          <button
            onClick={handleWhatsAppConsult}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp ဖြင့် ချက်ချင်းမေးမည်</span>
          </button>

          <a
            href={`tel:${settings.phone}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>ဖုန်းတိုက်ရိုက်ခေါ်ဆိုရန် ({settings.phone})</span>
          </a>

          <button
            onClick={() => openConsultModal(service.title)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
          >
            <span>အခမဲ့ တိုင်ပင်လွှာ ပို့ရန်</span>
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
              onClick={() => navigateTo('service-detail', rel.slug)}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                  <ServiceIcon name={rel.iconName} className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 font-burmese leading-snug">
                  {rel.title}
                </h4>
                <p className="text-xs text-slate-500 font-burmese line-clamp-2">
                  {rel.shortDescription}
                </p>
              </div>

              <div className="pt-2 text-xs font-semibold text-sky-700 font-burmese flex items-center gap-1">
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

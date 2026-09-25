import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ServiceIcon } from '../components/ServiceIcon';
import { Search, ChevronRight, MessageCircle, ShieldCheck } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const { services, categories, navigateTo, openConsultModal } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredServices = services.filter((svc) => {
    if (!svc.isActive) return false;
    const matchesCategory = selectedCategory === 'all' || svc.category === selectedCategory;
    const matchesSearch =
      svc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.detailedDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-12 pb-20">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-sky-50/60 to-white pt-12 pb-14 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-700">
            COMPREHENSIVE SERVICES
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-burmese leading-snug">
            ကျွန်ုပ်တို့၏ ဝန်ဆောင်မှုများ
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-burmese max-w-2xl mx-auto leading-relaxed">
            ဘန်ကောက်မြို့တွင် မြန်မာမိတ်ဆွေများ အဆင်ပြေချောမွေ့စွာ နေထိုင်နိုင်ရန် ဗီဇာ၊ စာရွက်စာတမ်း၊ ဘဏ်၊ အခန်းငှားရမ်းခြင်းနှင့် နေ့စဉ် လိုအပ်ချက်များကို စိတ်ချစွာ ကူညီပေးနေပါသည်။
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category Filter Pills (Functional Interactive buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none font-burmese">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-sky-600 text-white shadow-xs font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              အားလုံး ({services.filter((s) => s.isActive).length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-xs font-semibold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ဝန်ဆောင်မှု ရှာဖွေရန်..."
              className="w-full pl-9 pr-3.5 py-2 text-xs font-burmese bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Services Directory Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                    <ServiceIcon name={svc.iconName} className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 font-mono">
                    #{svc.order.toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 font-burmese leading-snug">
                    {svc.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-burmese">
                    {svc.shortDescription}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between gap-2 font-burmese">
                <button
                  onClick={() => navigateTo('service-detail', svc.slug)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-800 transition-colors"
                >
                  <span>အသေးစိတ်ကြည့်ရန်</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => openConsultModal(svc.title)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-sky-600" />
                  <span>တိုင်ပင်ရန်</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3 font-burmese">
            <p className="text-slate-500 text-sm">ရှာဖွေမှုနှင့် ကိုက်ညီသော ဝန်ဆောင်မှု မတွေ့ရှိပါ။</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-sky-600 hover:underline"
            >
              ရှာဖွေမှုကို ပြန်လည်စတင်ရန်
            </button>
          </div>
        )}

        {/* Reassurance Banner */}
        <div className="mt-14 p-6 bg-sky-50 rounded-2xl border border-sky-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-burmese">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                တရားဝင် စည်းမျဉ်းများနှင့်အညီ သာ တာဝန်ယူ ဆောင်ရွက်ပေးပါသည်
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                မည်သည့်ဝန်ဆောင်မှုတွင်မဆို လျှို့ဝှက်စရိတ် မရှိစေဘဲ လုပ်ငန်းစဉ်အစအဆုံးကို ကြိုတင်ရှင်းလင်းစွာ တိုင်ပင်ဆွေးနွေးပေးပါသည်။
              </p>
            </div>
          </div>

          <button
            onClick={() => openConsultModal()}
            className="shrink-0 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            အခမဲ့ တိုင်ပင်ရန်
          </button>
        </div>
      </section>
    </div>
  );
};

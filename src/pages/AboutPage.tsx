import React from 'react';
import { useApp } from '../context/AppContext';
import { HeartHandshake, Eye, Target, ArrowRight, MessageCircle, ShieldCheck, Users, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigateTo, openConsultModal } = useApp();

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-sky-50/60 to-white pt-12 pb-14 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-700">
            WE ARE A TRUSTED AGENT
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-burmese leading-snug">
            ကျွန်ုပ်တို့အကြောင်း
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-burmese max-w-2xl mx-auto leading-relaxed">
            ဘန်ကောက်မှာ ကိုယ့်ဘက်ကနေ ကူညီပေးမယ့် မိတ်ဆွေတစ်ယောက်လို အမြဲရှိနေပေးမည့် Solution for You
          </p>
        </div>
      </section>

      {/* Main Story & Agency Introduction */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-5 font-burmese">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
              <HeartHandshake className="w-4 h-4" />
              <span>စိတ်ချယုံကြည်ရသော ဝန်ဆောင်မှု</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
              WE ARE A TRUSTED AGENT
            </h2>

            <p className="text-base text-slate-700 leading-relaxed">
              ဘန်ကောက်မြို့တွင် နေထိုင်အလုပ်လုပ်ကိုင်နေကြသည့် အကိုအမတို့ နေထိုင်စဉ် ကြုံတွေ့ရလေ့ရှိသော ဗီဇာ၊ စာရွက်စာတမ်းနှင့် နေထိုင်ရေးဆိုင်ရာ အခက်အခဲမှန်သမျှ ကြုံတွေ့လာပါက <span className="font-semibold text-sky-700">"Solution for You"</span> ကို အပြည့်အဝ ယုံကြည်စိတ်ချစွာ သတိရလိုက်ပါ။
            </p>

            <p className="text-base text-slate-700 leading-relaxed">
              အကိုအမတို့၏ ခေါင်းခဲစရာ ကိစ္စများကို စေတနာအပြည့်ဖြင့် အမှန်ကန်ဆုံးနှင့် အမြန်ဆန်ဆုံး ကူညီဖြေရှင်းပေးမည်ဖြစ်ပြီး၊ လူကြီးမင်းတို့၏ စိတ်ကျေနပ်မှုနှင့် စိတ်အေးချမ်းမှုသည် ကျွန်ုပ်တို့၏ အဓိက ပန်းတိုင်ဖြစ်ပါသည်။
            </p>

            <div className="pt-2 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-800">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>လွယ်ကူ မြန်ဆန် စိတ်ချရမှု</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>မိတ်ဆွေလို ဖော်ရွေနွေးထွေးမှု</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-[16/11] bg-slate-100">
              <img
                src="/src/assets/images/about_team_assistance_1790239768198.jpg"
                alt="Solution for You Bangkok consultation office and team"
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">OUR VISION</h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-burmese">
              "ကျွန်ုပ်တို့၏ ကျေးဇူးရှင် မိတ်ဆွေများ၏ အချိန်နဲ့ ငွေကြေး ကုန်ကျစရိတ်ကို အထိရောက်ဆုံး သက်သာစေပြီး လွယ်ကူ၊ လျှင်မြန်၊ စိတ်ချရဆုံးသော ဗီဇာ၊ စာရွက်စာတမ်းနှင့် အထွေထွေ ဝန်ဆောင်မှုများကို တာဝန်ယူမှုအပြည့်ဖြင့် ဆောင်ရွက်ပေးမည့် အားအကိုးရဆုံး ကိုယ်စားလှယ် ဖြစ်လာစေရန် ဖြစ်ပါသည်။"
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">OUR MISSION</h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-burmese">
              "ဗီဇာ၊ စာရွက်စာတမ်းနဲ့ အထွေထွေဝန်ဆောင်မှုများကို လွယ်ကူရှင်းလင်းစေရန်၊ အချိန်နှင့် ကုန်ကျစရိတ်ကို အထူးသက်သာစေရန် နှင့် စိတ်အေးချမ်းစွာ ဝန်ဆောင်မှု အပြည့်အဝ ရရှိစေရန် စေတနာအပြည့်ဖြင့် လုပ်ငန်းစဉ် ပြီးဆုံးသည်အထိ တာဝန်ယူ ကူညီပေးရန် ဖြစ်ပါသည်။"
            </p>
          </div>
        </div>
      </section>

      {/* End Call To Action */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6 pt-6">
        <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold font-burmese">
            ဘန်ကောက်ရောက် မြန်မာမိတ်ဆွေများအတွက် အစဉ်အမြဲ အသင့်ရှိနေပါသည်
          </h2>
          <p className="text-sm text-slate-300 font-burmese max-w-xl mx-auto">
            မည်သည့်အခက်အခဲမျိုးမဆို ကြိုတင်တိုင်ပင်ဆွေးနွေးနိုင်ပါသည်။ အားမနာဘဲ ဆက်သွယ်လိုက်ပါ။
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-burmese pt-2">
            <button
              onClick={() => navigateTo('contact')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              <span>အခုပဲ ဆက်သွယ်ရန်</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => openConsultModal()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-sky-600" />
              <span>အခမဲ့ တိုင်ပင်ရန်</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

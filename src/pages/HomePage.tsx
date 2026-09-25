import React from 'react';
import { useApp } from '../context/AppContext';
import { ServiceIcon } from '../components/ServiceIcon';
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Heart,
  MessageCircle,
  ChevronRight,
  Calendar,
  CheckCircle2,
  FileText,
  UserCheck
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { services, posts, categories, navigateTo, openConsultModal, settings } = useApp();

  const activeServices = services.filter((s) => s.isActive);
  const recentPosts = posts.filter((p) => p.status === 'published').slice(0, 4);

  const trustPillars = [
    {
      num: '01',
      title: 'အစအဆုံး တာဝန်ယူပေးခြင်း',
      desc: 'စတင်တိုင်ပင်ချိန်မှ လုပ်ငန်းစဉ်အောင်မြင်စွာ ပြီးဆုံးသည်အထိ အဆင့်တိုင်းတွင် အစအဆုံး တာဝန်ယူ ကူညီပေးပါသည်။',
      icon: ShieldCheck,
    },
    {
      num: '02',
      title: 'ရှင်းလင်းသော အကြံဉာဏ်များ',
      desc: 'ရှုပ်ထွေးသော စည်းကမ်းသတ်မှတ်ချက်များကို မြန်မာလို ရိုးရှင်းစွာ ရှင်းပြပြီး လိုအပ်သည့်စာရွက်စာတမ်းကိုသာ တိကျစွာ လမ်းညွှန်ပေးပါသည်။',
      icon: Sparkles,
    },
    {
      num: '03',
      title: 'လွယ်ကူရှင်းလင်းသော လုပ်ငန်းစဉ်',
      desc: 'မလိုအပ်ဘဲ အချိန်ကြန့်ကြာခြင်း မရှိစေရန် စနစ်တကျ အဆင့်ဆင့် ပြင်ဆင်ပြီး အဆင်ပြေဆုံး နည်းလမ်းဖြင့် ဆောင်ရွက်ပေးပါသည်။',
      icon: FileText,
    },
    {
      num: '04',
      title: 'မြန်ဆန်ထိရောက်သော ဝန်ဆောင်မှု',
      desc: 'ရက်ကျော်ဒဏ်ကြေးနှင့် စာရွက်စာတမ်း အခက်အခဲ မဖြစ်ပေါ်စေရန် အချိန်နှင့်တပြေးညီ အမြန်ဆုံး ဆောင်ရွက်ပေးပါသည်။',
      icon: Clock,
    },
    {
      num: '05',
      title: 'မိတ်ဆွေတစ်ယောက်လို ဖော်ရွှေနွေးထွေးမှု',
      desc: 'စိမ်းကားသော ကုမ္ပဏီတစ်ခုလို မဟုတ်ဘဲ မိသားစုဝင် မိတ်ဆွေတစ်ယောက်လို ရင်းနှီးနွေးထွေးစွာ အနီးကပ် ရှိနေပေးပါသည်။',
      icon: Heart,
    },
  ];

  const steps = [
    { num: '01', title: 'ဆက်သွယ်ပါ', desc: 'ဖုန်း၊ WhatsApp၊ Messenger သို့မဟုတ် LINE မှတစ်ဆင့် ဆက်သွယ်ပါ။' },
    { num: '02', title: 'မိမိလိုအပ်ချက်ကို ပြောပြပါ', desc: 'ဗီဇာ၊ ဘဏ်၊ နေထိုင်ရေး စသည့် ကြုံတွေ့နေရသော အခက်အခဲကို ပြောပြပါ။' },
    { num: '03', title: 'လိုအပ်သော အချက်အလက်များကို စစ်ဆေးပေးမည်', desc: 'ကိုင်ဆောင်ထားသော စာရွက်စာတမ်းများ၏ သက်တမ်းနှင့် လိုအပ်ချက်များကို အခမဲ့ စစ်ဆေးပေးပါမည်။' },
    { num: '04', title: 'လုပ်ငန်းစဉ်ကို စတင်ဆောင်ရွက်မည်', desc: 'ရှင်းလင်းသော အစီအစဉ်အတိုင်း တိကျမြန်ဆန်စွာ ဆောင်ရွက်ပေးပါမည်။' },
    { num: '05', title: 'ပြီးဆုံးသည်အထိ ကူညီပေးမည်', desc: 'လူကြီးမင်းတို့ စိတ်အေးချမ်းသာစွာ အောင်မြင်ပြီးမြောက်သည်အထိ တာဝန်ယူပေးပါမည်။' },
  ];

  const getCategoryName = (catId: string) => {
    const found = categories.find((c) => c.id === catId);
    return found ? found.name : 'သုတဗဟုသုတ';
  };

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-white via-sky-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Trust statement label */}
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-800 bg-sky-100/70 px-3 py-1.5 rounded-full border border-sky-200/80 font-burmese">
                <UserCheck className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <span>{settings.heroTrustStatement || "Bangkok မှာ အားကိုးစွာ တိုင်ပင်နိုင်တဲ့ မိတ်ဆွေတစ်ယောက်"}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.3] font-burmese tracking-tight">
                {settings.heroHeadline || "ဗီဇာ၊ စာရွက်စာတမ်းနဲ့ နေထိုင်ရေးကိစ္စတွေကို တစ်နေရာတည်းမှာ အလွယ်တကူ ဖြေရှင်းလိုက်ပါ။"}
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-burmese max-w-2xl">
                {settings.heroSupportingText || "ဘန်ကောက်မှာ နေထိုင်အလုပ်လုပ်ကိုင်နေကြတဲ့ မြန်မာမိတ်ဆွေများအတွက် လွယ်ကူ၊ မြန်ဆန်၊ စိတ်ချရသော ဝန်ဆောင်မှုများကို အစအဆုံး တာဝန်ယူ ကူညီပေးနေပါတယ်။"}
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 font-burmese">
                <button
                  onClick={() => navigateTo('contact')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-md shadow-sky-600/20 transition-all active:scale-98"
                >
                  <span>အခုပဲ ဆက်သွယ်ရန်</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => openConsultModal()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-base border border-slate-300/80 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-sky-600" />
                  <span>အခမဲ့ တိုင်ပင်ရန်</span>
                </button>
              </div>

              {/* Emotional reassurance callout */}
              <div className="pt-4 border-t border-slate-200/80 flex items-center gap-3 text-xs sm:text-sm text-slate-500 font-burmese">
                <span className="text-amber-500 text-base">“</span>
                <p className="italic text-slate-700 font-medium">
                  {settings.emotionalQuote || "ဘန်ကောက်မှာ ကိုယ့်ဘက်ကနေ ကူညီပေးမယ့် မိတ်ဆွေတစ်ယောက်ရှိနေတယ်"}
                </p>
                <span className="text-amber-500 text-base">”</span>
              </div>
            </div>

            {/* Right Visual Carrier */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-100 aspect-[16/10] lg:aspect-[4/3] group">
                <img
                  src="/src/assets/images/hero_bangkok_community_1790239728277.jpg"
                  alt="Solution for You Bangkok Myanmar Community Assistance"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 text-white p-3 rounded-xl bg-slate-900/60 backdrop-blur-xs border border-white/15">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-sky-300">Solution for You</span>
                    <span className="text-slate-300">Bangkok, Thailand</span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1 font-burmese">
                    မြန်မာမိတ်ဆွေများ အားကိုးစွာ တိုင်ပင်နိုင်သော အကူအညီပေးရေး ဝန်ဆောင်မှု
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK SERVICE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-burmese">
            ဘာကိစ္စအတွက် ကူညီပေးရမလဲ?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-burmese">
            ဗီဇာ၊ စာရွက်စာတမ်း၊ ဘဏ်အကောင့်နှင့် နေထိုင်ရေးဆိုင်ရာ အဓိက ဝန်ဆောင်မှု (၁၂) မျိုး
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {activeServices.map((svc) => (
            <div
              key={svc.id}
              onClick={() => navigateTo('service-detail', svc.slug)}
              className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300 transition-all duration-200 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <ServiceIcon name={svc.iconName} className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors font-burmese leading-snug">
                  {svc.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-burmese line-clamp-3">
                  {svc.shortDescription}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-700 font-burmese">
                <span>အသေးစိတ်ကြည့်ရန်</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => navigateTo('services')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors font-burmese"
          >
            <span>ဝန်ဆောင်မှု အသေးစိတ်အားလုံး ကြည့်ရှုရန်</span>
            <ArrowRight className="w-4 h-4 text-sky-600" />
          </button>
        </div>
      </section>

      {/* 3. TRUST / WHY US */}
      <section className="bg-slate-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 space-y-2">
            <span className="text-xs uppercase tracking-widest text-sky-400 font-semibold">
              OUR PROMISE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-burmese">
              Solution for You ကို ဘာကြောင့် ရွေးချယ်ကြတာလဲ?
            </h2>
            <p className="text-sm text-slate-400 font-burmese">
              ခေါင်းခဲစရာ ကိစ္စများကို စေတနာအပြည့်ဖြင့် အမှန်ကန်ဆုံးနှင့် အမြန်ဆန်ဆုံး ကူညီဖြေရှင်းပေးပါမည်။
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {trustPillars.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.num}
                  className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-4 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold font-mono text-amber-400/90">
                      {item.num}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-slate-700/60 text-sky-400 flex items-center justify-center">
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white font-burmese leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed font-burmese">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">
            SIMPLE WORKFLOW
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-burmese">
            လုပ်ငန်းစဉ် ၅ ဆင့်
          </h2>
          <p className="text-sm text-slate-600 font-burmese">
            ရှုပ်ထွေးမှုမရှိဘဲ ရိုးရှင်းလွယ်ကူစွာဖြင့် အောင်မြင်အောင် ကူညီဆောင်ရွက်ပေးပုံ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3 relative group"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono">
                  {step.num}
                </span>
                {idx < steps.length - 1 && (
                  <span className="hidden md:inline-block w-4 h-px bg-slate-200 ml-auto" />
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 font-burmese">
                {step.title}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed font-burmese">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOMEPAGE BLOG PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">
              KNOWLEDGE CENTER
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-burmese">
              အသုံးဝင်တဲ့ အချက်အလက်များ
            </h2>
            <p className="text-sm text-slate-600 font-burmese">
              ထိုင်းနိုင်ငံရောက် မြန်မာမိတ်ဆွေများအတွက် လက်တွေ့အသုံးဝင်မယ့် သတင်းအချက်အလက်များ
            </p>
          </div>

          <button
            onClick={() => navigateTo('blog')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-700 hover:text-sky-800 transition-colors font-burmese self-start sm:self-auto"
          >
            <span>ဆောင်းပါးအားလုံးကြည့်ရန်</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => navigateTo('blog-detail', post.slug)}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-800 shadow-xs font-burmese">
                    {getCategoryName(post.categoryId)}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{post.publishedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTimeMinutes || 4} မိနစ်ဖတ်ရန်</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors font-burmese line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed font-burmese line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-1 flex items-center text-xs font-semibold text-sky-700 font-burmese">
                <span>ဆက်ဖတ်ရန်</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5.5 FACEBOOK PAGE & DAILY COMMUNITY SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 via-sky-900 to-slate-900 rounded-3xl overflow-hidden border border-blue-800/40 text-white shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Info */}
            <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-3 font-burmese">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
                  <span>Facebook Page Official Update</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                  နေ့စဉ် အချိန်နှင့်တပြေးညီ သတင်းများနှင့် အချက်အလက်များ
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  ထိုင်းနိုင်ငံ လဝက သတင်းများ၊ ဗီဇာနှင့် Work Permit အပြောင်းအလဲများ၊ ဘဏ်နှင့် နေထိုင်ရေးဆိုင်ရာ အရေးကြီး အသိပေးချက်များကို ကျွန်ုပ်တို့၏ Official Facebook Page တွင် အပတ်စဉ် ပုံမှန် ၄-၅ ပုဒ် တင်ဆက်ပေးနေပါသည်။
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 font-burmese">
                <a
                  href={settings.facebookPageUrl || "https://facebook.com/solution4u.official"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <span>Facebook Page သို့ သွားရောက်ကြည့်ရှုရန်</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href={settings.messengerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-sky-300" />
                  <span>Messenger မှ တိုက်ရိုက် မေးမြန်းရန်</span>
                </a>
              </div>
            </div>

            {/* Right Visual / Facebook Profile Preview */}
            <div className="lg:col-span-5 bg-slate-950/40 border-t lg:border-t-0 lg:border-l border-white/10 p-7 sm:p-8 flex flex-col justify-center items-center text-center space-y-4">
              <div className="relative">
                {settings.facebookProfileUrl || settings.logoUrl ? (
                  <img
                    src={settings.facebookProfileUrl || settings.logoUrl}
                    alt="Solution for You Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-400 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-blue-400 shadow-xl">
                    S4U
                  </div>
                )}
                <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px]">
                  ✓
                </span>
              </div>

              <div className="space-y-1 font-burmese">
                <h4 className="text-base font-bold text-white">Solution for You - အဖြေက ဒီမှာပါ</h4>
                <p className="text-xs text-sky-300">Bangkok Myanmar Service Agency</p>
                <p className="text-[11px] text-slate-400 pt-1">
                  မိတ်ဆွေများအတွက် စိတ်ချရသော အကူအညီ
                </p>
              </div>

              <div className="pt-2 text-xs text-slate-400 font-burmese">
                <span>Facebook & Messenger တွင် ၂၄ နာရီ မက်ဆေ့ခ်ျ ပို့ထားနိုင်ပါသည်</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-sky-700 via-sky-800 to-slate-900 text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl space-y-5 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-burmese leading-snug">
              အခက်အခဲရှိနေပါသလား?
            </h2>

            <p className="text-sm sm:text-base text-sky-100 leading-relaxed font-burmese">
              မိမိကိုယ်တိုင် ရှုပ်ထွေးစွာ ဖြေရှင်းနေစရာမလိုပါဘူး။ လိုအပ်တာကို ပြောပြပါ။ Solution for You က အကောင်းဆုံးဖြေရှင်းနိုင်မယ့် လမ်းကြောင်းကို အတူရှာပေးပါမယ်။
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-burmese">
              <button
                onClick={() => navigateTo('contact')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm shadow-md transition-colors active:scale-98"
              >
                <span>အခုပဲ ဆက်သွယ်ရန်</span>
                <ArrowRight className="w-4 h-4 text-sky-600" />
              </button>

              <button
                onClick={() => openConsultModal()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-sky-600/60 hover:bg-sky-600 text-white font-semibold text-sm border border-white/20 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>အခမဲ့ တိုင်ပင်ရန်</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

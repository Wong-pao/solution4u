import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTelegramUrl, getLineUrl } from '../data/initialData';
import { Phone, Mail, MapPin, Clock, MessageCircle, HeartHandshake, ShieldAlert, FileText, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, settings, services, staticPageContent } = useApp();
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'disclaimer' | null>(null);
  const [logoError, setLogoError] = useState(false);

  // Lock body scroll and listen for Escape key when legal modal is open
  React.useEffect(() => {
    if (!activeModal) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModal]);

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {settings.logoUrl && !logoError ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.agencyName}
                  onError={() => setLogoError(true)}
                  className="w-10 h-10 rounded-xl object-cover shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  <HeartHandshake className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-white text-xl tracking-tight">Solution for You</h3>
                <p className="text-sky-400 text-sm font-medium font-burmese">အဖြေက ဒီမှာပါ</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md font-burmese">
              {staticPageContent?.footerDescription || "ဗီဇာ၊ စာရွက်စာတမ်းနှင့် နေထိုင်ရေးဆိုင်ရာ ဝန်ဆောင်မှုများကို တစ်နေရာတည်းမှာ အလွယ်တကူ ရယူနိုင်ရန် ကူညီပေးနေပါတယ်။ ဘန်ကောက်မှာ ကိုယ့်ဘက်ကနေ ကူညီပေးမယ့် မိတ်ဆွေတစ်ယောက်လို အမြဲရှိနေပါမယ်။"}
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <a
                href={settings.messengerUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600/90 text-white border border-blue-500/60 hover:bg-blue-600 transition-colors inline-flex items-center gap-1.5 font-semibold"
              >
                <span>Messenger</span>
              </a>
              <a
                href={`tel:${settings.phone}`}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Phone: {settings.phone}</span>
              </a>
              <a
                href={getLineUrl(settings)}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-green-950/60 text-green-300 border border-green-800/60 hover:bg-green-900/80 transition-colors inline-flex items-center gap-1.5"
              >
                <span>LINE: {settings.lineId}</span>
              </a>
              <a
                href={getTelegramUrl(settings)}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-sky-950/60 text-sky-300 border border-sky-800/60 hover:bg-sky-900/80 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Telegram</span>
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Email</span>
              </a>
              <a
                href={settings.facebookPageUrl || "https://facebook.com/solution4u.official"}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-950/70 text-blue-300 border border-blue-800/60 hover:bg-blue-900/80 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Facebook Page</span>
              </a>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase">Menu Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  className="hover:text-white text-slate-400 transition-colors flex items-center gap-2"
                >
                  <span className="font-medium">Home</span>
                  <span className="text-xs text-slate-500 font-burmese">(မူလစာမျက်နှာ)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('about')}
                  className="hover:text-white text-slate-400 transition-colors flex items-center gap-2"
                >
                  <span className="font-medium">About Us</span>
                  <span className="text-xs text-slate-500 font-burmese">(ကျွန်ုပ်တို့အကြောင်း)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="hover:text-white text-slate-400 transition-colors flex items-center gap-2"
                >
                  <span className="font-medium">Services</span>
                  <span className="text-xs text-slate-500 font-burmese">(ဝန်ဆောင်မှုများ)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('blog')}
                  className="hover:text-white text-slate-400 transition-colors flex items-center gap-2"
                >
                  <span className="font-medium">Insights</span>
                  <span className="text-xs text-slate-500 font-burmese">(သတင်းနှင့် ဆောင်းပါးများ)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('contact')}
                  className="hover:text-white text-slate-400 transition-colors flex items-center gap-2"
                >
                  <span className="font-medium">Contact Us</span>
                  <span className="text-xs text-slate-500 font-burmese">(ဆက်သွယ်ရန်)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Top Services */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase">အဓိက ဝန်ဆောင်မှုများ</h4>
            <ul className="space-y-2.5 text-sm font-burmese">
              {(services && services.length > 0
                ? services.filter((s) => s.isActive).slice(0, 5)
                : [
                    { id: '1', slug: 'bank-account', title: 'ဘဏ်အကောင့် ဖွင့်လှစ်ပေးခြင်း' },
                    { id: '2', slug: 'medical-interpreter', title: 'ဆေးရုံ/ဆေးခန်း စကားပြန်' },
                    { id: '3', slug: '90-days-report', title: '90 Days Report တိုင်ကြားခြင်း' },
                    { id: '4', slug: 'tm-30', title: 'TM.30 ဧည့်စာရင်း' },
                    { id: '5', slug: 'condo-rental', title: 'အိမ်၊ ကွန်ဒိုနှင့် အခန်း ရှာဖွေ/ငှားရမ်းခြင်း' },
                  ]
              ).map((svc) => (
                <li key={svc.id}>
                  <button
                    type="button"
                    onClick={() => navigateTo('service-detail', svc.slug)}
                    className="hover:text-white text-slate-400 transition-colors text-left cursor-pointer"
                  >
                    {svc.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact & Hours */}
          <div className="space-y-4 text-sm">
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase">ရုံးလိပ်စာနှင့် ဆက်သွယ်ရန်</h4>
            
            <div className="space-y-3 text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-1" />
                <span className="leading-snug">{settings.address}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">
                  {settings.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors truncate">
                  {settings.email}
                </a>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-200 font-medium">{settings.businessHoursWeekday}</p>
                    <p className="text-slate-400 mt-0.5">{settings.businessHoursWeekend}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory & Disclaimer Box */}
        <div className="mt-8 p-4 rounded-xl bg-slate-800/60 border border-slate-800 text-xs text-slate-400 leading-relaxed font-burmese flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p>{settings.disclaimer}</p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left">© {new Date().getFullYear()} Solution for You (အဖြေက ဒီမှာပါ). All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-6">
            <button
              onClick={() => navigateTo('privacy-policy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigateTo('terms-of-service')}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigateTo('disclaimer')}
              className="hover:text-white transition-colors"
            >
              Disclaimer
            </button>
          </div>
        </div>
      </div>

      {/* Legal Information Modal */}
      {activeModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-900 shadow-2xl space-y-4 cursor-default">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold">
                {activeModal === 'privacy' && 'ကိုယ်ရေးကိုယ်တာ အချက်အလက် မူဝါဒ (Privacy Policy)'}
                {activeModal === 'terms' && 'ဝန်ဆောင်မှု စည်းကမ်းသတ်မှတ်ချက်များ (Terms of Service)'}
                {activeModal === 'disclaimer' && 'တာဝန်ယူမှုဆိုင်ရာ ရှင်းလင်းချက် (Disclaimer)'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-sm text-slate-600 leading-relaxed space-y-3 max-h-80 overflow-y-auto font-burmese pr-1">
              {activeModal === 'privacy' && (
                <>
                  <p>
                    Solution for You သည် လူကြီးမင်းတို့ ပေးပို့အပ်နှံသော အမည်၊ ဖုန်းနံပါတ်၊ နိုင်ငံကူးလက်မှတ်နှင့် လဝကဆိုင်ရာ စာရွက်စာတမ်း အချက်အလက်များအား လျှို့ဝှက်ချက်အဖြစ် အလေးထား ထိန်းသိမ်းပါသည်။
                  </p>
                  <p>
                    သက်ဆိုင်ရာ ဝန်ဆောင်မှုလုပ်ငန်းစဉ်များ ဆောင်ရွက်ရန်အတွက်သာ အသုံးပြုပြီး ပြင်ပသို့ မည်သည့်အခါမျှ ရောင်းချခြင်း သို့မဟုတ် ပေါက်ကြားစေခြင်း မရှိစေရပါ။
                  </p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p>
                    ၁။ လူကြီးမင်းတို့ ပေးအပ်သော စာရွက်စာတမ်းများသည် အစစ်အမှန်ဖြစ်ရပါမည်။
                  </p>
                  <p>
                    ၂။ ဝန်ဆောင်မှုစရိတ်နှင့် လုပ်ငန်းစဉ် အဆင့်ဆင့်ကို ကြိုတင်ရှင်းလင်း အသိပေးပြီးမှသာ ဆောင်ရွက်ပါမည်။
                  </p>
                  <p>
                    ၃။ ထိုင်းနိုင်ငံ လဝက သို့မဟုတ် အလုပ်သမားဝန်ကြီးဌာနတို့၏ ရုတ်တရက် ဥပဒေစည်းမျဉ်း ပြောင်းလဲမှုများရှိပါက အချိန်နှင့်တပြေးညီ အသိပေးတိုင်ပင် ဆွေးနွေးပါမည်။
                  </p>
                </>
              )}

              {activeModal === 'disclaimer' && (
                <>
                  <p>
                    Solution for You သည် ထိုင်းနိုင်ငံရောက် မြန်မာမိတ်ဆွေများအား နေထိုင်ရေးနှင့် စာရွက်စာတမ်းကိစ္စများ လွယ်ကူစေရန် အကူအညီပေးသော ပုဂ္ဂလိက ဝန်ဆောင်မှုလုပ်ငန်းဖြစ်ပါသည်။ ထိုင်းအစိုးရ သို့မဟုတ် သံရုံးဆိုင်ရာ ရုံးဌာနတစ်ခု မဟုတ်ပါ။
                  </p>
                  <p>
                    တရားမဝင် နည်းလမ်းများဖြင့် ၁၀၀% အာမခံချက်ပေးခြင်းမျိုး လုံးဝမပြုလုပ်ဘဲ၊ တည်ဆဲဥပဒေ စည်းမျဉ်းစည်းကမ်းများနှင့်အညီ အမှန်ကန်ဆုံးနှင့် အဆင်ပြေဆုံးဖြစ်အောင် တာဝန်ယူ ကူညီပေးခြင်း ဖြစ်ပါသည်။
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                ပိတ်မည် (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

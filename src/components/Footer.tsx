import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, Mail, MapPin, Clock, MessageCircle, HeartHandshake, ShieldAlert, FileText, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, settings } = useApp();
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'disclaimer' | null>(null);

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.agencyName}
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
              ဗီဇာ၊ စာရွက်စာတမ်းနှင့် နေထိုင်ရေးဆိုင်ရာ ဝန်ဆောင်မှုများကို တစ်နေရာတည်းမှာ အလွယ်တကူ ရယူနိုင်ရန် ကူညီပေးနေပါတယ်။ ဘန်ကောက်မှာ ကိုယ့်ဘက်ကနေ ကူညီပေးမယ့် မိတ်ဆွေတစ်ယောက်လို အမြဲရှိနေပါမယ်။
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <a
                href={settings.facebookPageUrl || "https://facebook.com/solution4u.official"}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-950/70 text-blue-300 border border-blue-800/60 hover:bg-blue-900/80 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Facebook Page</span>
              </a>
              <a
                href={settings.messengerUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-sky-950/60 text-sky-300 border border-sky-800/60 hover:bg-sky-900/80 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Messenger</span>
              </a>
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/80 transition-colors inline-flex items-center gap-1.5"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href={settings.lineUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-green-950/60 text-green-300 border border-green-800/60 hover:bg-green-900/80 transition-colors inline-flex items-center gap-1.5"
              >
                <span>LINE: {settings.lineId}</span>
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
                  <span className="font-medium">Our Services</span>
                  <span className="text-xs text-slate-500 font-burmese">(ဝန်ဆောင်မှုများ)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('blog')}
                  className="hover:text-white text-slate-400 transition-colors flex items-center gap-2"
                >
                  <span className="font-medium">Contents</span>
                  <span className="text-xs text-slate-500 font-burmese">(သုတစုံလင်)</span>
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
              <li>
                <button
                  onClick={() => navigateTo('service-detail', 'bank-account')}
                  className="hover:text-white text-slate-400 transition-colors text-left"
                >
                  ဘဏ်အကောင့် ဖွင့်လှစ်ပေးခြင်း
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('service-detail', 'hospital-clinic-interpreter')}
                  className="hover:text-white text-slate-400 transition-colors text-left"
                >
                  ဆေးရုံ/ဆေးခန်း စကားပြန်
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('service-detail', '90-days-report')}
                  className="hover:text-white text-slate-400 transition-colors text-left"
                >
                  90 Days Report တိုင်ကြားခြင်း
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('service-detail', 'tm-30')}
                  className="hover:text-white text-slate-400 transition-colors text-left"
                >
                  TM.30 ဧည့်စာရင်း
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('service-detail', 'room-condo')}
                  className="hover:text-white text-slate-400 transition-colors text-left"
                >
                  အိမ်၊ ကွန်ဒို ရှာဖွေငှားရမ်းခြင်း
                </button>
              </li>
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
          <p>© {new Date().getFullYear()} Solution for You (အဖြေက ဒီမှာပါ). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveModal('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveModal('disclaimer')}
              className="hover:text-white transition-colors"
            >
              Disclaimer
            </button>
            <button
              onClick={() => navigateTo('admin')}
              className="hover:text-white text-slate-500 transition-colors"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>

      {/* Legal Information Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-900 shadow-2xl space-y-4">
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

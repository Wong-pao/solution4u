import React, { useState } from 'react';
import { useApp, AppRoute } from '../context/AppContext';
import { Phone, MessageCircle, Menu, X, HeartHandshake } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentRoute, navigateTo, settings, openConsultModal } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const navLinks: { label: string; sub: string; route: AppRoute }[] = [
    { label: 'Home', sub: 'မူလစာမျက်နှာ', route: 'home' },
    { label: 'About Us', sub: 'ကျွန်ုပ်တို့အကြောင်း', route: 'about' },
    { label: 'Services', sub: 'ဝန်ဆောင်မှုများ', route: 'services' },
    { label: 'Insights', sub: 'သတင်းနှင့် ဆောင်းပါးများ', route: 'blog' },
    { label: 'Contact Us', sub: 'ဆက်သွယ်ရန်', route: 'contact' },
  ];

  const handleNav = (route: AppRoute) => {
    navigateTo(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Zone 1: Single text element wordmark with custom logo support */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => handleNav('home')}
              className="group text-left flex items-center gap-2 sm:gap-3 focus:outline-hidden"
              aria-label="Solution for You Home"
            >
              {settings.logoUrl && !logoError ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.agencyName}
                  onError={() => setLogoError(true)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-sm transition-transform group-hover:scale-105 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105 shrink-0">
                  <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-base sm:text-lg leading-tight tracking-tight whitespace-nowrap">
                  Solution for You
                </span>
                <span className="text-xs text-sky-700 font-medium font-burmese whitespace-nowrap">
                  အဖြေက ဒီမှာပါ
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 5 clean text navigation links */}
          <nav className="hidden md:flex items-center md:gap-3.5 lg:gap-5 xl:gap-8 text-sm lg:text-[15px] font-medium text-slate-600">
            {navLinks.map((item) => {
              const isActive =
                currentRoute === item.route ||
                (item.route === 'services' && currentRoute === 'service-detail') ||
                (item.route === 'blog' && currentRoute === 'blog-detail');
              return (
                <button
                  key={item.route}
                  onClick={() => handleNav(item.route)}
                  className={`relative py-1.5 transition-colors whitespace-nowrap group ${
                    isActive
                      ? 'text-sky-700 font-semibold'
                      : 'hover:text-slate-900 text-slate-600'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="leading-snug">{item.label}</span>
                    <span className="text-[11.5px] leading-snug mt-0.5 text-slate-500 group-hover:text-sky-600 font-burmese transition-colors">
                      {item.sub}
                    </span>
                  </div>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1–2 primary actions */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-3 shrink-0">
            <a
              href={`tel:${settings.phone}`}
              className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-sky-700 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-sky-600" />
              <span>{settings.phone}</span>
            </a>

            <button
              onClick={() => openConsultModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>အခမဲ့ တိုင်ပင်ရန်</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => openConsultModal()}
              className="px-2.5 py-1.5 text-xs font-medium text-white bg-sky-600 rounded-lg shadow-xs whitespace-nowrap font-burmese"
            >
              တိုင်ပင်ရန်
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in fade-in duration-150">
          {navLinks.map((item) => {
            const isActive =
              currentRoute === item.route ||
              (item.route === 'services' && currentRoute === 'service-detail') ||
              (item.route === 'blog' && currentRoute === 'blog-detail');
            return (
              <button
                key={item.route}
                onClick={() => handleNav(item.route)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-[13px] text-slate-500 font-burmese">{item.sub}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNav('contact');
              }}
              className="w-full text-center py-2.5 px-4 rounded-lg bg-sky-600 text-white text-sm font-semibold shadow-xs"
            >
              အခုပဲ ဆက်သွယ်ရန်
            </button>

            <div className="flex items-center justify-between pt-2 px-1 text-xs text-slate-500">
              <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-1 hover:text-sky-600">
                <Phone className="w-3.5 h-3.5" />
                <span>{settings.phone}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
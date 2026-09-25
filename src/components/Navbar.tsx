import React, { useState } from 'react';
import { useApp, AppRoute } from '../context/AppContext';
import { Phone, MessageCircle, Menu, X, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentRoute, navigateTo, settings, openConsultModal } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; sub: string; route: AppRoute }[] = [
    { label: 'Home', sub: 'မူလစာမျက်နှာ', route: 'home' },
    { label: 'About Us', sub: 'ကျွန်ုပ်တို့အကြောင်း', route: 'about' },
    { label: 'Our Services', sub: 'ဝန်ဆောင်မှုများ', route: 'services' },
    { label: 'Contents', sub: 'သုတအချက်အလက်', route: 'blog' },
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
          <div className="flex items-center">
            <button
              onClick={() => handleNav('home')}
              className="group text-left flex items-center gap-3 focus:outline-hidden"
              aria-label="Solution for You Home"
            >
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.agencyName}
                  className="w-10 h-10 rounded-xl object-cover shadow-sm transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
                  <HeartHandshake className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                  Solution for You
                </span>
                <span className="text-xs text-sky-700 font-medium font-burmese">
                  အဖြေက ဒီမှာပါ
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 5 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600">
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
                    <span className="leading-tight">{item.label}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-sky-600 font-burmese transition-colors">
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
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={`tel:${settings.phone}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-sky-700 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
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

            <button
              onClick={() => handleNav('admin')}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Admin Dashboard"
              aria-label="Admin Dashboard"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => openConsultModal()}
              className="px-2.5 py-1.5 text-xs font-medium text-white bg-sky-600 rounded-lg shadow-xs"
            >
              တိုင်ပင်ရန်
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation menu"
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
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-xs text-slate-400 font-burmese">{item.sub}</span>
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
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNav('admin');
                }}
                className="inline-flex items-center gap-1 hover:text-slate-800"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

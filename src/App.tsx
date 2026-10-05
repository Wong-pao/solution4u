import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingContact } from './components/FloatingContact';
import { QuickConsultModal } from './components/QuickConsultModal';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { BlogPage } from './pages/BlogPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { ContactPage } from './pages/ContactPage';

// Lazy-load AdminPage so admin modules, project exporter, and editors are not loaded by public visitors
const AdminPage = React.lazy(() =>
  import('./pages/AdminPage').then((m) => ({ default: m.AdminPage }))
);

function AppContent() {
  const { currentRoute } = useApp();

  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'services':
        return <ServicesPage />;
      case 'service-detail':
        return <ServiceDetailPage />;
      case 'blog':
        return <BlogPage />;
      case 'blog-detail':
        return <BlogDetailPage />;
      case 'contact':
        return <ContactPage />;
      case 'admin':
        return (
          <React.Suspense
            fallback={
              <div className="min-h-[70vh] flex flex-col items-center justify-center font-burmese space-y-3">
                <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Admin Portal စနစ်ကို ဖွင့်လှစ်နေပါသည်...</p>
              </div>
            }
          >
            <AdminPage />
          </React.Suspense>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFB] text-slate-900 selection:bg-sky-100 selection:text-sky-900 font-sans">
      <Navbar />
      <main className="flex-1">
        {renderCurrentView()}
      </main>
      <Footer />
      <FloatingContact />
      <QuickConsultModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

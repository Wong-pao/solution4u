import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, Service, SiteSettings, Category, ConsultationInquiry } from '../types';
import { dataStore } from '../lib/supabase';
import { INITIAL_SETTINGS } from '../data/initialData';

export type AppRoute = 'home' | 'about' | 'services' | 'service-detail' | 'blog' | 'blog-detail' | 'contact' | 'admin';

interface AppContextType {
  currentRoute: AppRoute;
  currentSlug: string | null;
  navigateTo: (route: AppRoute, slug?: string) => void;
  posts: Post[];
  services: Service[];
  categories: Category[];
  settings: SiteSettings;
  isLoading: boolean;
  isAdminLoggedIn: boolean;
  loginAdmin: (pass: string) => boolean;
  logoutAdmin: () => void;
  refreshData: () => Promise<void>;
  savePost: (post: Post) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  updateService: (service: Service) => Promise<void>;
  updateSettings: (settings: SiteSettings) => Promise<void>;
  isConsultModalOpen: boolean;
  openConsultModal: (serviceName?: string) => void;
  closeConsultModal: () => void;
  consultServicePreselect: string;
  submitInquiry: (inquiry: Omit<ConsultationInquiry, 'id' | 'createdAt' | 'status'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [consultServicePreselect, setConsultServicePreselect] = useState('');

  // Synchronize URL hash for clean back/forward browser button support and direct bookmarks
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (!hash || hash === '/' || hash === 'home') {
        setCurrentRoute('home');
        setCurrentSlug(null);
      } else if (hash.startsWith('/services/')) {
        setCurrentRoute('service-detail');
        setCurrentSlug(hash.replace('/services/', ''));
      } else if (hash === '/services') {
        setCurrentRoute('services');
        setCurrentSlug(null);
      } else if (hash.startsWith('/blog/')) {
        setCurrentRoute('blog-detail');
        setCurrentSlug(hash.replace('/blog/', ''));
      } else if (hash === '/blog') {
        setCurrentRoute('blog');
        setCurrentSlug(null);
      } else if (hash === '/about') {
        setCurrentRoute('about');
        setCurrentSlug(null);
      } else if (hash === '/contact') {
        setCurrentRoute('contact');
        setCurrentSlug(null);
      } else if (hash === '/admin' || hash.startsWith('/admin')) {
        setCurrentRoute('admin');
        setCurrentSlug(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: AppRoute, slug?: string) => {
    setCurrentRoute(route);
    setCurrentSlug(slug || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let hash = '';
    if (route === 'home') hash = '#/';
    else if (route === 'about') hash = '#/about';
    else if (route === 'services') hash = '#/services';
    else if (route === 'service-detail') hash = `#/services/${slug || ''}`;
    else if (route === 'blog') hash = '#/blog';
    else if (route === 'blog-detail') hash = `#/blog/${slug || ''}`;
    else if (route === 'contact') hash = '#/contact';
    else if (route === 'admin') hash = '#/admin';

    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash);
    }
  };

  const refreshData = async () => {
    try {
      const [fetchedPosts, fetchedServices, fetchedSettings, fetchedCategories] = await Promise.all([
        dataStore.getPosts(),
        dataStore.getServices(),
        dataStore.getSettings(),
        dataStore.getCategories(),
      ]);
      setPosts(fetchedPosts);
      setServices(fetchedServices);
      setSettings(fetchedSettings);
      setCategories(fetchedCategories);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const adminSession = localStorage.getItem('solution4u_admin_session');
    if (adminSession === 'active') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const loginAdmin = (pass: string) => {
    // Admin password for solution for you dashboard
    if (pass === 'solution4u' || pass === 'admin2026' || pass === 'solution4u@bkk') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('solution4u_admin_session', 'active');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('solution4u_admin_session');
  };

  const savePost = async (post: Post) => {
    await dataStore.savePost(post);
    await refreshData();
  };

  const deletePost = async (id: string) => {
    await dataStore.deletePost(id);
    await refreshData();
  };

  const updateService = async (service: Service) => {
    await dataStore.updateService(service);
    await refreshData();
  };

  const updateSettings = async (newSettings: SiteSettings) => {
    await dataStore.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const openConsultModal = (serviceName?: string) => {
    setConsultServicePreselect(serviceName || '');
    setIsConsultModalOpen(true);
  };

  const closeConsultModal = () => {
    setIsConsultModalOpen(false);
  };

  const submitInquiry = async (inquiry: Omit<ConsultationInquiry, 'id' | 'createdAt' | 'status'>) => {
    await dataStore.saveInquiry(inquiry);
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        currentSlug,
        navigateTo,
        posts,
        services,
        categories,
        settings,
        isLoading,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        refreshData,
        savePost,
        deletePost,
        updateService,
        updateSettings,
        isConsultModalOpen,
        openConsultModal,
        closeConsultModal,
        consultServicePreselect,
        submitInquiry,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

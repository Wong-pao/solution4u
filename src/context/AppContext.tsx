import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Post,
  Service,
  SiteSettings,
  Category,
  ConsultationInquiry,
  AboutPageContent,
  TrustPillarsContent,
  WorkflowStepsContent,
  StaticPageContent,
  ContactPageContent,
} from '../types';
import {
  dataStore,
  supabase,
  isSupabaseConfigured,
  loginAdminWithSupabase,
  logoutAdminWithSupabase,
  DeletePostResult,
} from '../lib/supabase';
import {
  servicesApi,
  siteContentApi,
  inquiriesApi,
} from '../lib/cms';
import {
  INITIAL_SETTINGS,
  INITIAL_ABOUT_CONTENT,
  INITIAL_TRUST_PILLARS,
  INITIAL_WORKFLOW_STEPS,
  INITIAL_STATIC_PAGE_CONTENT,
  INITIAL_CONTACT_CONTENT,
} from '../data/initialData';

export type AppRoute = 'home' | 'about' | 'services' | 'service-detail' | 'blog' | 'blog-detail' | 'contact' | 'admin';

interface AppContextType {
  currentRoute: AppRoute;
  currentSlug: string | null;
  navigateTo: (route: AppRoute, slug?: string) => void;
  posts: Post[];
  services: Service[];
  categories: Category[];
  settings: SiteSettings;
  aboutContent: AboutPageContent;
  trustPillarsContent: TrustPillarsContent;
  workflowStepsContent: WorkflowStepsContent;
  staticPageContent: StaticPageContent;
  contactContent: ContactPageContent;
  isLoading: boolean;
  adminUserEmail: string | null;
  isAdminLoggedIn: boolean;
  loginAdmin: (credentials: { email?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  refreshData: () => Promise<void>;
  savePost: (post: Post) => Promise<void>;
  deletePost: (id: string) => Promise<DeletePostResult>;
  createService: (service: Partial<Service>) => Promise<Service>;
  updateService: (service: Service) => Promise<Service>;
  deleteService: (id: string) => Promise<{ success: boolean; error?: string }>;
  reorderServices: (reordered: Service[]) => Promise<void>;
  updateSettings: (settings: SiteSettings) => Promise<void>;
  updateAboutContent: (content: AboutPageContent) => Promise<void>;
  updateTrustPillars: (content: TrustPillarsContent) => Promise<void>;
  updateWorkflowSteps: (content: WorkflowStepsContent) => Promise<void>;
  updateStaticPageContent: (content: StaticPageContent) => Promise<void>;
  updateContactContent: (content: ContactPageContent) => Promise<void>;
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
  const [aboutContent, setAboutContent] = useState<AboutPageContent>(INITIAL_ABOUT_CONTENT);
  const [trustPillarsContent, setTrustPillarsContent] = useState<TrustPillarsContent>(INITIAL_TRUST_PILLARS);
  const [workflowStepsContent, setWorkflowStepsContent] = useState<WorkflowStepsContent>(INITIAL_WORKFLOW_STEPS);
  const [staticPageContent, setStaticPageContent] = useState<StaticPageContent>(INITIAL_STATIC_PAGE_CONTENT);
  const [contactContent, setContactContent] = useState<ContactPageContent>(INITIAL_CONTACT_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUserEmail, setAdminUserEmail] = useState<string | null>(null);
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

  // Synchronize dynamic document title & SEO meta tags per route
  useEffect(() => {
    let title = 'Solution for You – အဖြေက ဒီမှာပါ | Bangkok Myanmar Service Agency';
    let description = 'ဘန်ကောက်ရှိ မြန်မာမိတ်ဆွေများအတွက် ဗီဇာ၊ စာရွက်စာတမ်း၊ ဘဏ်အကောင့်၊ နေထိုင်ရေးနှင့် အထွေထွေဝန်ဆောင်မှုများကို အစအဆုံး စိတ်ချစွာ ကူညီပေးနေပါသည်။';

    switch (currentRoute) {
      case 'home':
        title = 'Solution for You – အဖြေက ဒီမှာပါ | Bangkok Myanmar Service Agency';
        break;
      case 'about':
        title = 'ကျွန်ုပ်တို့အကြောင်း (About Us) | Solution for You - အဖြေက ဒီမှာပါ';
        description = 'Solution for You ၏ မျှော်မှန်းချက်၊ လုပ်ငန်းစဉ်နှင့် ဘန်ကောက်ရောက် မြန်မာမိတ်ဆွေများအတွက် စေတနာထား ကူညီပေးနေမှုများ။';
        break;
      case 'services':
        title = 'ဝန်ဆောင်မှုများ (Our Services) | Solution for You - အဖြေက ဒီမှာပါ';
        description = 'ဗီဇာသက်တမ်းတိုး၊ CI စာအုပ်၊ ဘဏ်အကောင့်ဖွင့်၊ TM-30၊ ကွန်ဒိုတိုက်ခန်းငှားရမ်းခြင်း အပါအဝင် ဝန်ဆောင်မှု (၁၂) မျိုး။';
        break;
      case 'service-detail': {
        const currentService = services.find((s) => s.slug === currentSlug);
        if (currentService) {
          title = `${currentService.title} | ဝန်ဆောင်မှုအသေးစိတ် | Solution for You`;
          description = currentService.shortDescription || description;
        } else {
          title = 'ဝန်ဆောင်မှု အသေးစိတ် | Solution for You';
        }
        break;
      }
      case 'blog':
        title = 'သုတဆောင်းပါးများ (Knowledge & Blog) | Solution for You - အဖြေက ဒီမှာပါ';
        description = 'ဘန်ကောက်တွင် နေထိုင်အလုပ်လုပ်ကိုင်ရာတွင် မဖြစ်မနေသိထားသင့်သည့် ဗီဇာ၊ ဥပဒေနှင့် နေထိုင်ရေး သုတဆောင်းပါးများ။';
        break;
      case 'blog-detail': {
        const currentPost = posts.find((p) => p.slug === currentSlug);
        if (currentPost) {
          title = `${currentPost.title} | Solution for You`;
          description = currentPost.excerpt || description;
        } else {
          title = 'ဆောင်းပါး အပြည့်အစုံ | Solution for You';
        }
        break;
      }
      case 'contact':
        title = 'ဆက်သွယ်ရန် (Contact Us) | Solution for You - အဖြေက ဒီမှာပါ';
        description = 'Messenger၊ ဖုန်းနံပါတ်၊ LINE၊ Telegram နှင့် အီးမေးလ် တို့မှတစ်ဆင့် Solution for You သို့ အခမဲ့ တိုက်ရိုက် ဆက်သွယ်တိုင်ပင်နိုင်ပါသည်။';
        break;
      case 'admin':
        title = 'Admin CMS Portal | Solution for You';
        break;
    }

    document.title = title;

    if (typeof document !== 'undefined') {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', title);
      }
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute('content', description);
      }
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', title);
      }
      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (twitterDesc) {
        twitterDesc.setAttribute('content', description);
      }
    }
  }, [currentRoute, currentSlug, services, posts]);

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
      const [
        fetchedPosts,
        fetchedServices,
        fetchedSettings,
        fetchedCategories,
        fetchedAbout,
        fetchedTrust,
        fetchedWorkflow,
        fetchedStatic,
        fetchedContact,
      ] = await Promise.all([
        dataStore.getPosts(),
        servicesApi.getServices(true),
        siteContentApi.getSiteContent<SiteSettings>('general_settings', INITIAL_SETTINGS),
        dataStore.getCategories(),
        siteContentApi.getSiteContent<AboutPageContent>('about_page', INITIAL_ABOUT_CONTENT),
        siteContentApi.getSiteContent<TrustPillarsContent>('home_trust_pillars', INITIAL_TRUST_PILLARS),
        siteContentApi.getSiteContent<WorkflowStepsContent>('home_workflow_steps', INITIAL_WORKFLOW_STEPS),
        siteContentApi.getSiteContent<StaticPageContent>('static_page_content', INITIAL_STATIC_PAGE_CONTENT),
        siteContentApi.getSiteContent<ContactPageContent>('contact_page', INITIAL_CONTACT_CONTENT),
      ]);
      setPosts(fetchedPosts);
      setServices(fetchedServices);
      setSettings(fetchedSettings);
      setCategories(fetchedCategories);
      setAboutContent(fetchedAbout);
      setTrustPillarsContent(fetchedTrust);
      setWorkflowStepsContent(fetchedWorkflow);
      setStaticPageContent(fetchedStatic);
      setContactContent(fetchedContact);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    if (isSupabaseConfigured && supabase) {
      // 1. Check existing Supabase session on startup
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (!error && session?.user) {
          setIsAdminLoggedIn(true);
          setAdminUserEmail(session.user.email || null);
        } else {
          setIsAdminLoggedIn(false);
          setAdminUserEmail(null);
        }
      });

      // 2. Subscribe to auth state changes (sign in, sign out, token renewal, session expiry)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAdminLoggedIn(true);
          setAdminUserEmail(session.user.email || null);
        } else {
          setIsAdminLoggedIn(false);
          setAdminUserEmail(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // When Supabase is not configured, admin is not logged in by default
      setIsAdminLoggedIn(false);
      setAdminUserEmail(null);
    }
  }, []);

  const loginAdmin = async ({
    email = '',
    password,
  }: {
    email?: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    // Admin Login strictly requires Supabase Authentication.
    // Absolutely NO demo passwords, NO preview fallbacks, NO localStorage bypass.
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error:
          'Supabase Authentication is not configured. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      };
    }

    const res = await loginAdminWithSupabase(email, password);
    if (res.success) {
      setIsAdminLoggedIn(true);
      setAdminUserEmail(email.trim());
      return { success: true };
    }
    // Return actual Supabase error - DO NOT fall back to anything else
    return { success: false, error: res.error || 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။' };
  };

  const logoutAdmin = async () => {
    await logoutAdminWithSupabase();
    setIsAdminLoggedIn(false);
    setAdminUserEmail(null);
  };

  const savePost = async (post: Post) => {
    await dataStore.savePost(post);
    await refreshData();
  };

  const deletePost = async (id: string): Promise<DeletePostResult> => {
    const res = await dataStore.deletePost(id);
    await refreshData();
    return res;
  };

  const createService = async (service: Partial<Service>): Promise<Service> => {
    const created = await servicesApi.createService(service);
    await refreshData();
    return created;
  };

  const updateService = async (service: Service): Promise<Service> => {
    const updated = await servicesApi.updateService(service);
    await refreshData();
    return updated;
  };

  const deleteService = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const res = await servicesApi.deleteService(id);
    await refreshData();
    return res;
  };

  const reorderServices = async (reordered: Service[]): Promise<void> => {
    for (const svc of reordered) {
      await servicesApi.updateService(svc);
    }
    await refreshData();
  };

  const updateSettings = async (newSettings: SiteSettings) => {
    await dataStore.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const updateAboutContent = async (content: AboutPageContent) => {
    await siteContentApi.upsertSiteContent('about_page', 'about', content);
    setAboutContent(content);
  };

  const updateTrustPillars = async (content: TrustPillarsContent) => {
    await siteContentApi.upsertSiteContent('home_trust_pillars', 'home', content);
    setTrustPillarsContent(content);
  };

  const updateWorkflowSteps = async (content: WorkflowStepsContent) => {
    await siteContentApi.upsertSiteContent('home_workflow_steps', 'home', content);
    setWorkflowStepsContent(content);
  };

  const updateStaticPageContent = async (content: StaticPageContent) => {
    await siteContentApi.upsertSiteContent('static_page_content', 'static', content);
    setStaticPageContent(content);
  };

  const updateContactContent = async (content: ContactPageContent) => {
    await siteContentApi.upsertSiteContent('contact_page', 'contact', content);
    setContactContent(content);
  };

  const openConsultModal = (serviceName?: string) => {
    setConsultServicePreselect(serviceName || '');
    setIsConsultModalOpen(true);
  };

  const closeConsultModal = () => {
    setIsConsultModalOpen(false);
  };

  const submitInquiry = async (inquiry: Omit<ConsultationInquiry, 'id' | 'createdAt' | 'status'>) => {
    await inquiriesApi.createInquiry(inquiry);
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
        aboutContent,
        trustPillarsContent,
        workflowStepsContent,
        staticPageContent,
        contactContent,
        isLoading,
        adminUserEmail,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        refreshData,
        savePost,
        deletePost,
        createService,
        updateService,
        deleteService,
        reorderServices,
        updateSettings,
        updateAboutContent,
        updateTrustPillars,
        updateWorkflowSteps,
        updateStaticPageContent,
        updateContactContent,
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

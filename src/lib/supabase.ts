import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_POSTS, INITIAL_SERVICES, INITIAL_SETTINGS, INITIAL_CATEGORIES } from '../data/initialData';
import { Post, Service, SiteSettings, Category, ConsultationInquiry } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local storage keys for resilient persistence
const STORAGE_KEYS = {
  POSTS: 'solution4u_posts_v1',
  SERVICES: 'solution4u_services_v1',
  SETTINGS: 'solution4u_settings_v1',
  CATEGORIES: 'solution4u_categories_v1',
  INQUIRIES: 'solution4u_inquiries_v1',
  AUTH: 'solution4u_admin_auth_v1',
};

// Seed LocalStorage if empty
function initializeStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
}

initializeStorage();

export const dataStore = {
  // Posts CRUD
  async getPosts(): Promise<Post[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('published_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt || '',
            content: item.content || '',
            coverImage: item.cover_image || '',
            categoryId: item.category_id || 'general',
            author: item.author || 'Solution for You Team',
            status: item.status || 'published',
            publishedAt: item.published_at || new Date().toISOString().split('T')[0],
            updatedAt: item.updated_at || item.published_at,
            seoTitle: item.seo_title || item.title,
            seoDescription: item.seo_description || item.excerpt,
            tags: item.tags || [],
            isFeatured: item.is_featured || false,
            readTimeMinutes: item.read_time_minutes || 4,
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store:', err);
      }
    }

    // LocalStorage fallback
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    return raw ? JSON.parse(raw) : INITIAL_POSTS;
  },

  async savePost(post: Post): Promise<Post> {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    let posts: Post[] = raw ? JSON.parse(raw) : [...INITIAL_POSTS];
    const index = posts.findIndex((p) => p.id === post.id);

    if (index >= 0) {
      posts[index] = post;
    } else {
      posts.unshift(post);
    }
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    if (supabase) {
      try {
        await supabase.from('posts').upsert({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          cover_image: post.coverImage,
          category_id: post.categoryId,
          author: post.author,
          status: post.status,
          published_at: post.publishedAt,
          updated_at: post.updatedAt,
          seo_title: post.seoTitle,
          seo_description: post.seoDescription,
          tags: post.tags,
          is_featured: post.isFeatured,
          read_time_minutes: post.readTimeMinutes,
        });
      } catch (err) {
        console.warn('Supabase save failed:', err);
      }
    }

    return post;
  },

  async deletePost(id: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (raw) {
      const posts: Post[] = JSON.parse(raw);
      const filtered = posts.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(filtered));
    }

    if (supabase) {
      try {
        await supabase.from('posts').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete failed:', err);
      }
    }
  },

  // Services
  async getServices(): Promise<Service[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return raw ? JSON.parse(raw) : INITIAL_SERVICES;
  },

  async updateService(updated: Service): Promise<Service> {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    const services: Service[] = raw ? JSON.parse(raw) : [...INITIAL_SERVICES];
    const index = services.findIndex((s) => s.id === updated.id);
    if (index >= 0) {
      services[index] = updated;
    }
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    return updated;
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : INITIAL_SETTINGS;
  },

  async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : INITIAL_CATEGORIES;
  },

  // Inquiries
  async saveInquiry(inquiry: Omit<ConsultationInquiry, 'id' | 'createdAt' | 'status'>): Promise<ConsultationInquiry> {
    const newInquiry: ConsultationInquiry = {
      ...inquiry,
      id: 'inq_' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    const raw = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    const inquiries: ConsultationInquiry[] = raw ? JSON.parse(raw) : [];
    inquiries.unshift(newInquiry);
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    return newInquiry;
  },

  async getInquiries(): Promise<ConsultationInquiry[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    return raw ? JSON.parse(raw) : [];
  },
};

// Complete Supabase SQL Schema for reference and copy-paste in Admin
export const SUPABASE_SQL_SCHEMA = `-- Solution for You (အဖြေက ဒီမှာပါ) - Supabase Schema
-- Run this in Supabase SQL Editor

-- 1. Profiles (for Admins)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Posts
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  author TEXT DEFAULT 'Solution for You Team',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  published_at DATE DEFAULT CURRENT_DATE,
  updated_at DATE DEFAULT CURRENT_DATE,
  seo_title TEXT,
  seo_description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  read_time_minutes INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Services
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  detailed_description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Allow public read published posts"
  ON public.posts FOR SELECT
  USING (status = 'published');

-- Public can read active services
CREATE POLICY "Allow public read active services"
  ON public.services FOR SELECT
  USING (is_active = true);

-- Public can read categories
CREATE POLICY "Allow public read categories"
  ON public.categories FOR SELECT
  USING (true);

-- Authenticated admins can perform full CRUD
CREATE POLICY "Allow authenticated full access to posts"
  ON public.posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to services"
  ON public.services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
`;

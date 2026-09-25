import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_POSTS, INITIAL_SERVICES, INITIAL_SETTINGS, INITIAL_CATEGORIES } from '../data/initialData';
import { Post, Service, SiteSettings, Category, ConsultationInquiry } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== ''
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Supabase Authentication Functions for Admin
export async function getAdminSession() {
  if (!supabase) return null;
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Supabase getSession notice:', error.message);
      return null;
    }
    return session;
  } catch (err) {
    console.warn('Supabase getSession exception:', err);
    return null;
  }
}

export async function loginAdminWithSupabase(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase Authentication is not configured. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.warn('Supabase Auth signIn error:', error.message);
      let userFriendly = error.message;
      if (error.message.includes('Invalid login credentials')) {
        userFriendly = 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။ (Invalid login credentials - Supabase Dashboard > Users တွင် စစ်ဆေးပါ)';
      } else if (error.message.includes('Email not confirmed')) {
        userFriendly = 'အီးမေးလ် အတည်ပြုရန် လိုအပ်နေပါသည်။ (Email not confirmed - Supabase Dashboard > Authentication > Users တွင် Confirm Email ပြုလုပ်ပေးပါ)';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        userFriendly = 'ကွန်ရက် ချိတ်ဆက်မှု မအောင်မြင်ပါ။ အင်တာနက် လိုင်း စစ်ဆေးပေးပါ။';
      }
      return { success: false, error: userFriendly };
    }

    if (data.session) {
      return { success: true };
    }
    return { success: false, error: 'အကောင့်ဝင်ရောက်မှု မအောင်မြင်ပါ။' };
  } catch (err: any) {
    return { success: false, error: err.message || 'အကောင့်ဝင်ရောက်မှု မအောင်မြင်ပါ။' };
  }
}

export async function logoutAdminWithSupabase(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut notice:', err);
    }
  }
}

// Local storage keys for resilient persistence & offline fallback
const STORAGE_KEYS = {
  POSTS: 'solution4u_posts_v1',
  SERVICES: 'solution4u_services_v1',
  SETTINGS: 'solution4u_settings_v1',
  CATEGORIES: 'solution4u_categories_v1',
  INQUIRIES: 'solution4u_inquiries_v1',
  MIGRATION: 'solution4u_posts_migrated_v1',
};

// Seed LocalStorage if empty for offline / initial state
function initializeStorage() {
  if (typeof window === 'undefined') return;
  try {
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
  } catch (err) {
    console.warn('LocalStorage initialization notice:', err);
  }
}

initializeStorage();

// UUID helpers for Postgres uuid type compatibility
export function isValidUuid(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fall through to manual generator
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Convert a seed or legacy ID (e.g. 'post-1') into a deterministic valid UUID v4
export function toValidUuid(seed: string): string {
  if (isValidUuid(seed)) return seed;

  if (seed === 'post-1') return '11111111-1111-4111-8111-111111111111';
  if (seed === 'post-2') return '22222222-2222-4222-8222-222222222222';
  if (seed === 'post-3') return '33333333-3333-4333-8333-333333333333';

  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex = (
    Math.abs(h1).toString(16).padStart(8, '0') +
    Math.abs(h2).toString(16).padStart(8, '0') +
    Math.abs(h1 ^ h2).toString(16).padStart(8, '0') +
    Math.abs(h1 + h2).toString(16).padStart(8, '0')
  ).slice(0, 32);

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

// Generate URL slug from title
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 50);
  return base || 'post-' + Date.now();
}

// Map a Supabase row (with columns: id, title, content, category, cover_image, created_at, updated_at) to the frontend Post interface
export function mapSupabaseRowToPost(row: any): Post {
  const publishedDate = row.created_at
    ? new Date(row.created_at).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  const updatedDate = row.updated_at
    ? new Date(row.updated_at).toISOString().split('T')[0]
    : publishedDate;

  const generatedSlug =
    row.slug ||
    (row.title
      ? row.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .slice(0, 50)
      : '') ||
    row.id;

  const plainText = (row.content || '').replace(/[#*`_>]/g, '').trim();
  const generatedExcerpt =
    row.excerpt || (plainText ? plainText.slice(0, 160) + '...' : row.title);

  return {
    id: row.id,
    title: row.title || 'Untitled Post',
    slug: generatedSlug,
    excerpt: generatedExcerpt,
    content: row.content || '',
    coverImage: row.cover_image || '/src/assets/images/hero_bangkok_community_1790239728277.jpg',
    categoryId: row.category || row.category_id || 'visa-immigration',
    author: row.author || 'Solution for You Team',
    status: (row.status === 'draft' ? 'draft' : 'published') as 'draft' | 'published',
    publishedAt: publishedDate,
    updatedAt: updatedDate,
    seoTitle: row.seo_title || `${row.title} | Solution for You`,
    seoDescription: row.seo_description || generatedExcerpt,
    tags: Array.isArray(row.tags) && row.tags.length > 0 ? row.tags : [row.category || 'ဗီဇာ'],
    isFeatured: Boolean(row.is_featured),
    readTimeMinutes:
      row.read_time_minutes || Math.max(2, Math.ceil((row.content?.length || 0) / 400)),
  };
}

// Update LocalStorage cache
function updateLocalCache(posts: Post[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  } catch (err) {
    console.warn('Could not update LocalStorage cache:', err);
  }
}

// -------------------------------------------------------------
// DATA ACCESS LAYER: POSTS & SUPABASE STORAGE
// -------------------------------------------------------------

/**
 * Fetch all posts:
 * - If Supabase is configured, fetches from public.posts ordered by created_at DESC.
 * - If the Supabase table is empty on first run, automatically initiates safe one-time migration.
 * - Falls back to LocalStorage cache gracefully if Supabase is offline or not configured.
 */
export async function getPosts(): Promise<Post[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase getPosts notice (using local cache):', error.message);
      } else if (data) {
        if (data.length > 0) {
          const mapped = data.map(mapSupabaseRowToPost);
          updateLocalCache(mapped);
          return mapped;
        } else {
          // Table is empty. Perform safe one-time migration if not yet done.
          const hasMigrated = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEYS.MIGRATION) === 'true';
          if (!hasMigrated) {
            console.log('Supabase posts table is empty. Running safe initial migration...');
            const result = await migrateLocalPostsToSupabase();
            if (result.migrated > 0) {
              const { data: refetched } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });
              if (refetched && refetched.length > 0) {
                const mapped = refetched.map(mapSupabaseRowToPost);
                updateLocalCache(mapped);
                return mapped;
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Supabase fetch exception (using local cache):', err);
    }
  }

  // Graceful LocalStorage fallback
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.POSTS) : null;
    return raw ? JSON.parse(raw) : INITIAL_POSTS;
  } catch {
    return INITIAL_POSTS;
  }
}

/**
 * Fetch a single post by ID or slug.
 */
export async function getPostById(idOrSlug: string): Promise<Post | null> {
  if (supabase && isValidUuid(idOrSlug)) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', idOrSlug)
        .maybeSingle();

      if (!error && data) {
        return mapSupabaseRowToPost(data);
      }
    } catch (err) {
      console.warn('Supabase getPostById notice:', err);
    }
  }

  const posts = await getPosts();
  return posts.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
}

/**
 * Create a new post:
 * - Inserts into Supabase table public.posts with columns matching the user's table.
 * - Updates LocalStorage cache so the UI updates instantly.
 */
export async function createPost(postData: Omit<Post, 'id'> & { id?: string }): Promise<Post> {
  const newId = postData.id && isValidUuid(postData.id) ? postData.id : generateUuid();
  const now = new Date().toISOString();

  const fullPost: Post = {
    ...postData,
    id: newId,
    publishedAt: postData.publishedAt || now.split('T')[0],
    updatedAt: now.split('T')[0],
    coverImage: postData.coverImage || '',
    categoryId: postData.categoryId || 'visa-immigration',
    status: postData.status || 'published',
    slug: postData.slug || generateSlug(postData.title),
    excerpt: postData.excerpt || postData.title,
    author: postData.author || 'Solution for You Team',
    seoTitle: postData.seoTitle || `${postData.title} | Solution for You`,
    seoDescription: postData.seoDescription || postData.excerpt || '',
    tags: postData.tags || [],
    isFeatured: postData.isFeatured || false,
    readTimeMinutes: postData.readTimeMinutes || 4,
  };

  if (supabase) {
    // Enforce authenticated session for Supabase writes
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Admin Authentication လိုအပ်ပါသည်။ စနစ်သို့ အကောင့်ပြန်ဝင်ပေးပါ။ (Supabase Session Expired)');
    }

    const payload = {
      id: newId,
      title: fullPost.title,
      content: fullPost.content,
      category: fullPost.categoryId,
      cover_image: fullPost.coverImage,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert post failed:', error);
      throw new Error(`Supabase insert failed: ${error.message}`);
    }

    if (data) {
      const created = mapSupabaseRowToPost(data);
      // Sync local cache
      const local = await getLocalPosts();
      updateLocalCache([created, ...local.filter((p) => p.id !== created.id)]);
      return created;
    }
  }

  // Fallback: save to LocalStorage
  const local = await getLocalPosts();
  updateLocalCache([fullPost, ...local.filter((p) => p.id !== fullPost.id)]);
  return fullPost;
}

/**
 * Update an existing post in Supabase public.posts.
 */
export async function updatePost(id: string, updates: Partial<Post>): Promise<Post> {
  const now = new Date().toISOString();

  if (supabase) {
    // Enforce authenticated session for Supabase updates
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Admin Authentication လိုအပ်ပါသည်။ စနစ်သို့ အကောင့်ပြန်ဝင်ပေးပါ။ (Supabase Session Expired)');
    }

    const payload: Record<string, any> = {
      updated_at: now,
    };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.categoryId !== undefined) payload.category = updates.categoryId;
    if (updates.coverImage !== undefined) payload.cover_image = updates.coverImage;

    const { data, error } = await supabase
      .from('posts')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update post failed:', error);
      throw new Error(`Supabase update failed: ${error.message}`);
    }

    if (data) {
      const updated = mapSupabaseRowToPost(data);
      const local = await getLocalPosts();
      const updatedList = local.map((p) => (p.id === id ? { ...p, ...updated } : p));
      updateLocalCache(updatedList);
      return updated;
    }
  }

  // Fallback: update in LocalStorage
  const local = await getLocalPosts();
  const index = local.findIndex((p) => p.id === id);
  if (index >= 0) {
    local[index] = { ...local[index], ...updates, updatedAt: now.split('T')[0] };
    updateLocalCache(local);
    return local[index];
  }

  throw new Error(`Post ${id} not found to update.`);
}

/**
 * Delete a post from Supabase public.posts and remove from local cache.
 */
export async function deletePost(id: string): Promise<void> {
  if (supabase) {
    // Enforce authenticated session for Supabase deletes
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Admin Authentication လိုအပ်ပါသည်။ စနစ်သို့ အကောင့်ပြန်ဝင်ပေးပါ။ (Supabase Session Expired)');
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete post failed:', error);
      throw new Error(`Supabase delete failed: ${error.message}`);
    }
  }

  // Remove from LocalStorage cache
  const local = await getLocalPosts();
  const filtered = local.filter((p) => p.id !== id);
  updateLocalCache(filtered);
}

/**
 * Upload an image file to Supabase Storage bucket 'blog-images'.
 * Returns the permanent public URL to the uploaded image.
 */
export async function uploadPostImage(file: File): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify.');
  }

  // Enforce authenticated session for Supabase Storage uploads
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Admin Authentication လိုအပ်ပါသည်။ ဓာတ်ပုံတင်ရန် အကောင့်ပြန်ဝင်ပေးပါ။ (Supabase Session Expired)');
  }

  // Collision-safe filename: blog-images/{unique-id}-{sanitized-filename}
  const ext = file.name.split('.').pop() || 'jpg';
  const cleanBase = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .slice(0, 30);
  const uniqueId = generateUuid().slice(0, 8);
  const filePath = `${Date.now()}-${uniqueId}-${cleanBase}.${ext}`;

  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Supabase Storage upload error:', error);
    throw new Error(`Image upload to bucket "blog-images" failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Safe LocalStorage to Supabase Migration:
 * - Detects existing posts in LocalStorage / INITIAL_POSTS.
 * - Checks Supabase table to avoid creating duplicate posts.
 * - Converts non-UUID IDs (e.g. 'post-1') into valid PostgreSQL UUIDs.
 * - Inserts only posts that do not already exist.
 * - Marks migration as complete.
 */
export async function migrateLocalPostsToSupabase(): Promise<{
  migrated: number;
  total: number;
  message: string;
}> {
  if (!supabase) {
    return {
      migrated: 0,
      total: 0,
      message: 'Supabase is not configured. Local fallback remains active.',
    };
  }

  try {
    // 1. Get existing posts currently in Supabase
    const { data: existingRows, error: checkError } = await supabase
      .from('posts')
      .select('id, title');

    if (checkError) {
      console.warn('Supabase migration check notice:', checkError.message);
      return { migrated: 0, total: 0, message: `Check failed: ${checkError.message}` };
    }

    const existingTitles = new Set(
      (existingRows || []).map((r) => r.title?.trim().toLowerCase())
    );
    const existingIds = new Set((existingRows || []).map((r) => r.id));

    // 2. Read local posts
    const localPosts = await getLocalPosts();

    // 3. Filter out posts that already exist in Supabase
    const toInsert = localPosts.filter((p) => {
      const titleLower = p.title.trim().toLowerCase();
      if (existingTitles.has(titleLower)) return false;
      const targetUuid = toValidUuid(p.id);
      if (existingIds.has(targetUuid)) return false;
      return true;
    });

    if (toInsert.length === 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.MIGRATION, 'true');
      }
      return {
        migrated: 0,
        total: localPosts.length,
        message: 'All local posts already exist in Supabase.',
      };
    }

    // 4. Map into Supabase public.posts columns
    const rows = toInsert.map((p) => {
      const validId = toValidUuid(p.id);
      const createdDate = p.publishedAt
        ? new Date(p.publishedAt).toISOString()
        : new Date().toISOString();
      const updatedDate = p.updatedAt
        ? new Date(p.updatedAt).toISOString()
        : createdDate;

      return {
        id: validId,
        title: p.title,
        content: p.content,
        category: p.categoryId || 'visa-immigration',
        cover_image: p.coverImage || '',
        created_at: createdDate,
        updated_at: updatedDate,
      };
    });

    const { data, error } = await supabase
      .from('posts')
      .upsert(rows, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Migration insert failed:', error);
      return {
        migrated: 0,
        total: localPosts.length,
        message: `Migration failed: ${error.message}`,
      };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.MIGRATION, 'true');
    }

    const count = data ? data.length : rows.length;
    return {
      migrated: count,
      total: localPosts.length,
      message: `Successfully migrated ${count} posts to Supabase.`,
    };
  } catch (err: any) {
    console.error('Migration error:', err);
    return {
      migrated: 0,
      total: 0,
      message: err.message || 'Unknown migration error',
    };
  }
}

// Helper to safely read from LocalStorage
async function getLocalPosts(): Promise<Post[]> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.POSTS) : null;
    return raw ? JSON.parse(raw) : INITIAL_POSTS;
  } catch {
    return INITIAL_POSTS;
  }
}

// -------------------------------------------------------------
// UNIFIED DATASTORE WRAPPER (FOR APP CONTEXT & EXISTING PAGES)
// -------------------------------------------------------------
export const dataStore = {
  getPosts,
  getPostById,
  savePost: async (post: Post): Promise<Post> => {
    // If post already has a valid UUID, attempt update; otherwise create
    if (post.id && isValidUuid(post.id)) {
      try {
        if (supabase) {
          const { data } = await supabase.from('posts').select('id').eq('id', post.id).maybeSingle();
          if (data) {
            return await updatePost(post.id, post);
          }
        }
      } catch {
        // Fall through to create
      }
    }
    return await createPost(post);
  },
  deletePost,
  uploadPostImage,
  migrateLocalPostsToSupabase,

  // Services
  async getServices(): Promise<Service[]> {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SERVICES) : null;
      return raw ? JSON.parse(raw) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  },

  async updateService(updated: Service): Promise<Service> {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SERVICES) : null;
    const services: Service[] = raw ? JSON.parse(raw) : [...INITIAL_SERVICES];
    const index = services.findIndex((s) => s.id === updated.id);
    if (index >= 0) {
      services[index] = updated;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    }
    return updated;
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SETTINGS) : null;
      return raw ? JSON.parse(raw) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
    return settings;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.CATEGORIES) : null;
      return raw ? JSON.parse(raw) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  // Inquiries
  async saveInquiry(inquiry: Omit<ConsultationInquiry, 'id' | 'createdAt' | 'status'>): Promise<ConsultationInquiry> {
    const newInquiry: ConsultationInquiry = {
      ...inquiry,
      id: 'inq_' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.INQUIRIES) : null;
      const inquiries: ConsultationInquiry[] = raw ? JSON.parse(raw) : [];
      inquiries.unshift(newInquiry);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
      }
    } catch (e) {
      console.warn('Inquiry save notice:', e);
    }
    return newInquiry;
  },

  async getInquiries(): Promise<ConsultationInquiry[]> {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.INQUIRIES) : null;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
};

// SQL Schema for reference in Admin portal
export const SUPABASE_SQL_SCHEMA = `-- Solution for You - Supabase Secure Schema
-- 1. Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 3. SECURE RLS POLICIES FOR POSTS TABLE
-- Allow public visitors (anon + authenticated) to read posts
CREATE POLICY "Allow public read posts"
  ON public.posts FOR SELECT
  USING (true);

-- SECURE: Only authenticated Admin users can insert, update, or delete posts
CREATE POLICY "Allow authenticated insert posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (true);

-- 4. Storage Bucket Setup (blog-images)
-- Ensure bucket exists and is marked public for read access
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. SECURE STORAGE POLICIES FOR 'blog-images'
-- Public can view blog images
CREATE POLICY "Allow public read blog-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

-- SECURE: Only authenticated Admin users can upload, update, or delete images
CREATE POLICY "Allow authenticated upload blog-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Allow authenticated update blog-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-images');

CREATE POLICY "Allow authenticated delete blog-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images');
`;

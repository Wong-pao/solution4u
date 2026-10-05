import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_POSTS, INITIAL_SERVICES, INITIAL_SETTINGS, INITIAL_CATEGORIES } from '../data/initialData';
import { Post, Service, SiteSettings, Category, ConsultationInquiry } from '../types';
import { servicesApi, siteContentApi, inquiriesApi } from './cms';

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

export interface DeletePostResult {
  success: boolean;
  postId: string;
  databaseDeleted: boolean;
  imageDeleted?: boolean;
  imageWarning?: string;
  error?: string;
}

/**
 * Extracts the storage object path from a Supabase Storage public URL.
 * Only returns a path if the URL actually belongs to the given bucket.
 * e.g., https://xxx.supabase.co/storage/v1/object/public/blog-images/1727255400-abc-my-post.jpg -> 1727255400-abc-my-post.jpg
 */
export function extractStoragePath(url: string, bucket = 'blog-images'): string | null {
  if (!url || typeof url !== 'string') return null;

  const sanitizeExtractedPath = (raw: string): string | null => {
    try {
      const decoded = decodeURIComponent(raw).trim();
      if (!decoded || decoded.includes('..') || decoded.startsWith('/') || decoded.includes('\\')) {
        return null;
      }
      return decoded;
    } catch {
      return null;
    }
  };

  // 1. Standard public URL: /storage/v1/object/public/{bucket}/<path>
  const publicMarker = `/storage/v1/object/public/${bucket}/`;
  const pIndex = url.indexOf(publicMarker);
  if (pIndex !== -1) {
    const raw = url.slice(pIndex + publicMarker.length).split('?')[0].split('#')[0];
    return sanitizeExtractedPath(raw);
  }

  // 2. Signed URL: /storage/v1/object/sign/{bucket}/<path>
  const signMarker = `/storage/v1/object/sign/${bucket}/`;
  const sIndex = url.indexOf(signMarker);
  if (sIndex !== -1) {
    const raw = url.slice(sIndex + signMarker.length).split('?')[0].split('#')[0];
    return sanitizeExtractedPath(raw);
  }

  // 3. Direct path: /storage/v1/object/{bucket}/<path>
  const directMarker = `/storage/v1/object/${bucket}/`;
  const dIndex = url.indexOf(directMarker);
  if (dIndex !== -1) {
    const raw = url.slice(dIndex + directMarker.length).split('?')[0].split('#')[0];
    return sanitizeExtractedPath(raw);
  }

  return null;
}

/**
 * Safely removes a file from Supabase Storage bucket 'blog-images'.
 * Gracefully handles missing files or non-storage URLs.
 */
export async function deletePostImage(imageUrl: string, bucket = 'blog-images'): Promise<{
  attempted: boolean;
  success: boolean;
  filePath?: string;
  error?: string;
}> {
  const filePath = extractStoragePath(imageUrl, bucket);
  if (!filePath) {
    // Not a Supabase Storage image in this bucket (e.g. local asset or external URL)
    return { attempted: false, success: true };
  }

  if (!supabase) {
    return { attempted: false, success: false, filePath, error: 'Supabase is not configured' };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { attempted: false, success: false, filePath, error: 'Admin session required' };
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.warn(`Supabase Storage remove error (${filePath}):`, error.message);
      return { attempted: true, success: false, filePath, error: error.message };
    }

    return { attempted: true, success: true, filePath };
  } catch (err: any) {
    console.warn(`Supabase Storage remove exception (${filePath}):`, err);
    return { attempted: true, success: false, filePath, error: err.message || 'Storage error' };
  }
}

/**
 * Delete a post from Supabase public.posts and remove from local cache.
 * Cleans up associated cover image from Supabase Storage bucket 'blog-images' if present.
 */
export async function deletePost(id: string): Promise<DeletePostResult> {
  const targetId = isValidUuid(id) ? id : toValidUuid(id);

  // 1. Identify cover image URL before deleting post record
  let coverImageUrl: string | null = null;
  const local = await getLocalPosts();
  const localPost = local.find((p) => p.id === id || p.id === targetId);
  if (localPost?.coverImage) {
    coverImageUrl = localPost.coverImage;
  }

  // 2. Delete from Supabase public.posts
  if (supabase) {
    // Enforce authenticated session for Supabase deletes
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Admin Authentication လိုအပ်ပါသည်။ စနစ်သို့ အကောင့်ပြန်ဝင်ပေးပါ။ (Supabase Session Expired)');
    }

    // If cover image not found in local cache, query it from Supabase before deletion
    if (!coverImageUrl) {
      try {
        const { data: row } = await supabase
          .from('posts')
          .select('cover_image')
          .or(`id.eq.${targetId},id.eq.${id}`)
          .maybeSingle();
        if (row?.cover_image) {
          coverImageUrl = row.cover_image;
        }
      } catch (err) {
        console.warn('Could not pre-fetch cover_image before deletion:', err);
      }
    }

    const { error: dbError } = await supabase
      .from('posts')
      .delete()
      .or(`id.eq.${targetId},id.eq.${id}`);

    if (dbError) {
      console.error('Supabase delete post failed:', dbError);
      throw new Error(`Supabase delete failed: ${dbError.message}`);
    }
  }

  // 3. Database deletion succeeded: remove from LocalStorage cache immediately
  const filtered = local.filter((p) => p.id !== id && p.id !== targetId);
  updateLocalCache(filtered);

  // 4. Image Cleanup: Delete cover image from Supabase Storage 'blog-images' bucket
  let imageDeleted = false;
  let imageWarning: string | undefined = undefined;

  if (coverImageUrl && supabase) {
    const storageRes = await deletePostImage(coverImageUrl, 'blog-images');
    if (storageRes.attempted) {
      if (storageRes.success) {
        imageDeleted = true;
      } else {
        imageWarning = `Database မှ ဆောင်းပါးကို အောင်မြင်စွာ ဖျက်ပြီးပါပြီ။ သို့သော် Storage ပုံဖျက်ရာတွင် အမှားဖြစ်ခဲ့ပါသည်: ${storageRes.error}`;
        console.warn(imageWarning);
      }
    }
  }

  return {
    success: true,
    postId: id,
    databaseDeleted: true,
    imageDeleted,
    imageWarning,
  };
}

/**
 * Automatically resize & compress image files using browser canvas before storage upload.
 * Scales down oversized photos (>1600px max width/height) and compresses large JPEGs/PNGs.
 * Completely dependency-free using standard HTML5 Canvas API.
 */
export async function optimizeImageBeforeUpload(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<File> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return file;
  if (!file.type.startsWith('image/') || file.size < 150 * 1024) {
    return file; // If already under 150KB, keep as is
  }

  return new Promise<File>((resolve) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;

        if (width <= maxWidth && height <= maxHeight && file.size < 500 * 1024) {
          return resolve(file);
        }

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              return resolve(file);
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, '') + (mimeType === 'image/png' ? '.png' : '.jpg');
            const optimizedFile = new File([blob], cleanName, { type: mimeType });
            resolve(optimizedFile);
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    } catch {
      resolve(file);
    }
  });
}

/**
 * Upload an image file to Supabase Storage bucket 'blog-images'.
 * Returns the permanent public URL to the uploaded image.
 */
export async function uploadPostImage(file: File): Promise<string> {
  if (!file) {
    throw new Error('ဖိုင် ရွေးချယ်ထားခြင်း မရှိပါ');
  }

  // 1. Strict file extension AND MIME type validation (JPG, JPEG, PNG, WEBP only)
  const rawExt = (file.name.split('.').pop() || '').toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedExtensions.includes(rawExt) || !allowedMimeTypes.includes(file.type)) {
    throw new Error('JPG, PNG သို့မဟုတ် WEBP ဓာတ်ပုံဖိုင်များသာ တင်ခွင့်ပြုပါသည် (Invalid file type: allowed JPG, PNG, WEBP)');
  }

  // 2. File size validation (<= 5 MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('ဓာတ်ပုံဖိုင်အရွယ်အစားသည် 5 MB ထက်မကျော်လွန်ရပါ (File size exceeds 5MB)');
  }

  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify.');
  }

  // Pre-upload client optimization
  const processedFile = await optimizeImageBeforeUpload(file);

  // Enforce authenticated session for Supabase Storage uploads
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Admin Authentication လိုအပ်ပါသည်။ ဓာတ်ပုံတင်ရန် အကောင့်ပြန်ဝင်ပေးပါ။ (Supabase Session Expired)');
  }

  // Collision-safe filename: blog-images/{unique-id}-{sanitized-filename}
  const processedExt = (processedFile.name.split('.').pop() || '').toLowerCase();
  const safeExt = allowedExtensions.includes(processedExt) ? processedExt : rawExt;
  const cleanBase = processedFile.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .slice(0, 30) || 'blog';
  const uniqueId = generateUuid().slice(0, 8);
  const filePath = `${Date.now()}-${uniqueId}-${cleanBase}.${safeExt}`;

  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(filePath, processedFile, {
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
 * Upload an image file to Supabase Storage bucket 'website-media'.
 * - Validates file type (JPG, PNG, WEBP)
 * - Validates file size (<= 5 MB)
 * - Requires active authenticated Admin session
 * - Subfolders: 'general', 'about', 'services'
 * - Collision-safe, timestamped, sanitized filename
 * - Returns permanent public URL
 */
export async function uploadWebsiteMedia(
  file: File,
  folder = 'general'
): Promise<string> {
  if (!file) {
    throw new Error('ဖိုင် ရွေးချယ်ထားခြင်း မရှိပါ');
  }

  // 1. File type validation (JPG, PNG, WEBP) — require BOTH valid extension AND valid MIME type
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.type)) {
    throw new Error('JPG, PNG သို့မဟုတ် WEBP ဓာတ်ပုံဖိုင်များသာ တင်ခွင့်ပြုပါသည် (Invalid file type: allowed JPG, PNG, WEBP)');
  }

  // 2. File size validation (<= 5 MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('ဓာတ်ပုံဖိုင်အရွယ်အစားသည် 5 MB ထက်မကျော်လွန်ရပါ (File size exceeds 5MB)');
  }

  // Pre-upload client optimization (downscale oversized photos, compress JPEGs/PNGs)
  const processedFile = await optimizeImageBeforeUpload(file);

  if (!supabase) {
    throw new Error('Supabase ချိတ်ဆက်မှု မရှိသေးပါ။ VITE_SUPABASE_URL နှင့် VITE_SUPABASE_ANON_KEY ထည့်သွင်းပေးပါ။');
  }

  // 3. Enforce authenticated session for Supabase Storage uploads
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Admin Authentication လိုအပ်ပါသည်။ ဓာတ်ပုံတင်ရန် အကောင့်ပြန်ဝင်ပေးပါ။ (Supabase Session Expired)');
  }

  // 4. Collision-safe filename: {folder}/{Date.now()}-{uniqueId}-{sanitized-filename}.{ext}
  const cleanBase = processedFile.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .slice(0, 30) || 'media';
  const uniqueId = generateUuid().slice(0, 8);
  const cleanFolder = folder.replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'general';
  const processedExt = (processedFile.name.split('.').pop() || '').toLowerCase();
  const safeExt = allowedExtensions.includes(processedExt) ? processedExt : ext;
  const filePath = `${cleanFolder}/${Date.now()}-${uniqueId}-${cleanBase}.${safeExt}`;

  const { error } = await supabase.storage
    .from('website-media')
    .upload(filePath, processedFile, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Supabase Storage upload error (website-media):', error);
    throw new Error(`ပုံတင်ခြင်း မအောင်မြင်ပါ ("website-media"): ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('website-media')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Safely removes an image file from Supabase Storage bucket 'website-media'.
 * - If the URL is empty or does NOT belong to 'website-media', safely returns true (no-op).
 * - Never deletes local assets, external URLs, or blog-images files.
 * - Requires authenticated admin session.
 */
export async function deleteWebsiteMedia(imageUrl: string): Promise<boolean> {
  if (!imageUrl || typeof imageUrl !== 'string') return true;

  const filePath = extractStoragePath(imageUrl, 'website-media');
  if (!filePath) {
    // Not a Supabase Storage file in 'website-media' (e.g. local asset or external URL)
    return true;
  }

  if (!supabase) {
    console.warn('Supabase is not configured, cannot delete website-media file:', filePath);
    return false;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('Cannot delete website-media file: Admin session expired');
      return false;
    }

    const { error } = await supabase.storage
      .from('website-media')
      .remove([filePath]);

    if (error) {
      console.warn(`Supabase Storage remove error (website-media/${filePath}):`, error.message);
      return false;
    }

    return true;
  } catch (err: any) {
    console.warn(`Supabase Storage remove exception (website-media/${filePath}):`, err);
    return false;
  }
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
    // Require authenticated Admin session before attempting database migration writes
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return {
        migrated: 0,
        total: 0,
        message: 'Admin authentication required to migrate posts to Supabase.',
      };
    }

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
    return await servicesApi.getServices(true);
  },

  async updateService(updated: Service): Promise<Service> {
    return await servicesApi.updateService(updated);
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    return await siteContentApi.getSiteContent<SiteSettings>('general_settings', INITIAL_SETTINGS);
  },

  async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    await siteContentApi.upsertSiteContent('general_settings', 'general', settings);
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
    const res = await inquiriesApi.createInquiry(inquiry);
    if (res.data) return res.data;
    return {
      ...inquiry,
      id: 'inq_' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'new',
    };
  },

  async getInquiries(): Promise<ConsultationInquiry[]> {
    return await inquiriesApi.getInquiries();
  },
};

// SQL Schema for reference in Admin portal
export const SUPABASE_SQL_SCHEMA = `-- Solution for You - Supabase Secure Schema & RLS Policies
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

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read posts"
  ON public.posts FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert posts"
  ON public.posts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update posts"
  ON public.posts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete posts"
  ON public.posts FOR DELETE TO authenticated USING (true);

-- 2. Services Table
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read services"
  ON public.services FOR SELECT USING (true);

CREATE POLICY "Allow authenticated manage services"
  ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Site Content Table
ALTER TABLE IF EXISTS public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read site_content"
  ON public.site_content FOR SELECT USING (true);

CREATE POLICY "Allow authenticated manage site_content"
  ON public.site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Inquiries Table (Public INSERT only; Authenticated Admin SELECT/UPDATE/DELETE)
ALTER TABLE IF EXISTS public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert inquiries"
  ON public.inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read inquiries"
  ON public.inquiries FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update inquiries"
  ON public.inquiries FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete inquiries"
  ON public.inquiries FOR DELETE TO authenticated USING (true);

-- 5. Storage Buckets Setup ('blog-images' & 'website-media')
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true), ('website-media', 'website-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 6. Storage RLS Policies ('blog-images' & 'website-media')
CREATE POLICY "Allow public read blog-images"
  ON storage.objects FOR SELECT USING (bucket_id IN ('blog-images', 'website-media'));

CREATE POLICY "Allow authenticated upload storage"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('blog-images', 'website-media'));

CREATE POLICY "Allow authenticated update storage"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('blog-images', 'website-media'));

CREATE POLICY "Allow authenticated delete storage"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('blog-images', 'website-media'));
`;

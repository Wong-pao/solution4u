/**
 * Solution for You - CMS Data Layer (Stage 2)
 *
 * Provides typed, resilient access to:
 * - public.services (Services catalog)
 * - public.site_content (Flexible Key-Value CMS content blocks)
 * - public.inquiries (Customer inquiry submissions)
 *
 * Security:
 * - Public visitors have read-only access to published content & active services.
 * - Public visitors can INSERT inquiries (no read/update/delete).
 * - Authenticated Admins have full CRUD under existing Row Level Security (RLS).
 * - Zero service_role or secret keys are used.
 * - Graceful fallback to localStorage/initialData if offline or Supabase unconfigured.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  Service,
  DbService,
  SiteContent,
  ConsultationInquiry,
  SiteSettings,
  AboutPageContent,
  TrustPillarsContent,
  WorkflowStepsContent,
  DbInquiry,
} from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_SETTINGS,
  INITIAL_ABOUT_CONTENT,
  INITIAL_TRUST_PILLARS,
  INITIAL_WORKFLOW_STEPS,
} from '../data/initialData';

export const STORAGE_BUCKET_MEDIA = 'website-media';
export const STORAGE_BUCKET_BLOG = 'blog-images';

export { uploadWebsiteMedia, deleteWebsiteMedia } from './supabase';

const STORAGE_KEYS = {
  SERVICES: 'solution4u_services_v1',
  SETTINGS: 'solution4u_settings_v1',
  ABOUT: 'solution4u_about_v1',
  TRUST_PILLARS: 'solution4u_trust_pillars_v1',
  WORKFLOW_STEPS: 'solution4u_workflow_steps_v1',
  INQUIRIES: 'solution4u_inquiries_v1',
};

const ALLOWED_INQUIRY_CHANNELS = new Set([
  'messenger',
  'phone',
  'line',
  'telegram',
  'email',
  'whatsapp',
]);

async function requireAdminSession(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Admin Authentication လိုအပ်ပါသည်။ စနစ်သို့ အကောင့်ပြန်ဝင်ပေးပါ။ (Supabase Session Required)');
  }
}

// ============================================================================
// DATA MAPPERS (Database snake_case <-> Frontend camelCase)
// ============================================================================

export function mapDbServiceToService(db: any): Service {
  return {
    id: String(db.id),
    slug: db.slug || String(db.id),
    title: db.title || '',
    shortDescription: db.short_description ?? db.shortDescription ?? '',
    detailedDescription: db.detailed_description ?? db.detailedDescription ?? '',
    iconName: db.icon_name ?? db.iconName ?? 'HelpCircle',
    category: db.category ?? 'visa-immigration',
    order: Number(db.display_order ?? db.order ?? 1),
    isActive: db.is_active !== undefined ? Boolean(db.is_active) : (db.isActive !== undefined ? Boolean(db.isActive) : true),
    coverImage: db.cover_image ?? db.coverImage ?? '',
    createdAt: db.created_at ?? db.createdAt,
    updatedAt: db.updated_at ?? db.updatedAt,
  };
}

export function mapServiceToDbRow(svc: Partial<Service>): Partial<DbService> {
  const row: any = {};
  if (svc.id !== undefined) row.id = svc.id;
  if (svc.slug !== undefined) row.slug = svc.slug;
  if (svc.title !== undefined) row.title = svc.title;
  if (svc.shortDescription !== undefined) row.short_description = svc.shortDescription;
  if (svc.detailedDescription !== undefined) row.detailed_description = svc.detailedDescription;
  if (svc.iconName !== undefined) row.icon_name = svc.iconName;
  if (svc.category !== undefined) row.category = svc.category;
  if (svc.order !== undefined) row.display_order = svc.order;
  if (svc.isActive !== undefined) row.is_active = svc.isActive;
  if (svc.coverImage !== undefined) row.cover_image = svc.coverImage;
  row.updated_at = new Date().toISOString();
  return row;
}

export function mapDbInquiryToInquiry(db: any): ConsultationInquiry {
  return {
    id: String(db.id),
    fullName: db.full_name ?? db.fullName ?? 'မိတ်ဆွေ',
    phoneNumber: db.phone_number ?? db.phoneNumber ?? '',
    contactChannel: (db.contact_channel ?? db.contactChannel ?? 'messenger') as any,
    serviceType: db.service_type ?? db.serviceType ?? 'အထွေထွေ အကြံပေးမှု',
    message: db.message ?? '',
    status: (db.status ?? 'new') as any,
    createdAt: db.created_at ?? db.createdAt ?? new Date().toISOString(),
  };
}

// ============================================================================
// 1. SERVICES CMS API
// ============================================================================

export const servicesApi = {
  /**
   * Fetch services.
   * By default, public reads return active services in display_order.
   * If all = true (e.g. for Admin portal), returns all including inactive ones.
   */
  async getServices(all = false): Promise<Service[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('services')
          .select('*')
          .order('display_order', { ascending: true });

        if (!all) {
          query = query.eq('is_active', true);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const mapped = data.map(mapDbServiceToService);
          // Update local cache for offline resilience
          try {
            if (typeof window !== 'undefined' && all) {
              localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(mapped));
            }
          } catch {}
          return mapped;
        } else if (error) {
          console.warn('[CMS] Supabase getServices notice, falling back to local:', error.message);
        }
      } catch (err) {
        console.warn('[CMS] getServices network error, falling back to local:', err);
      }
    }

    // Fallback: localStorage or INITIAL_SERVICES
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SERVICES) : null;
      const list: Service[] = raw ? JSON.parse(raw) : INITIAL_SERVICES;
      const sorted = [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
      return all ? sorted : sorted.filter((s) => s.isActive);
    } catch {
      return all ? INITIAL_SERVICES : INITIAL_SERVICES.filter((s) => s.isActive);
    }
  },

  /**
   * Fetch a single service by slug.
   */
  async getServiceBySlug(slug: string): Promise<Service | null> {
    if (isSupabaseConfigured && supabase && slug) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (!error && data) {
          return mapDbServiceToService(data);
        }
      } catch (err) {
        console.warn('[CMS] getServiceBySlug error, using fallback:', err);
      }
    }

    const all = await this.getServices(true);
    return all.find((s) => s.slug === slug) || null;
  },

  /**
   * Create a new service (Admin operation).
   */
  async createService(service: Partial<Service>): Promise<Service> {
    const newService: Service = {
      id: service.id || `svc_${Date.now()}`,
      slug: service.slug || `service-${Date.now()}`,
      title: service.title || 'ဝန်ဆောင်မှု အသစ်',
      shortDescription: service.shortDescription || '',
      detailedDescription: service.detailedDescription || '',
      iconName: service.iconName || 'HelpCircle',
      category: service.category || 'visa-immigration',
      order: service.order ?? 99,
      isActive: service.isActive ?? true,
      coverImage: service.coverImage || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await requireAdminSession();
        const dbRow = mapServiceToDbRow(newService);
        const { data, error } = await supabase
          .from('services')
          .insert(dbRow)
          .select()
          .single();

        if (error) {
          console.error('[CMS] Supabase createService error:', error);
          throw error;
        }
        if (data) {
          const created = mapDbServiceToService(data);
          await this.syncToLocalStorage(created);
          return created;
        }
      } catch (err) {
        console.error('[CMS] createService failed:', err);
        throw err;
      }
    }

    await this.syncToLocalStorage(newService);
    return newService;
  },

  /**
   * Update an existing service (Admin operation).
   */
  async updateService(updated: Service): Promise<Service> {
    if (isSupabaseConfigured && supabase) {
      try {
        await requireAdminSession();
        const dbRow = mapServiceToDbRow(updated);
        const { data, error } = await supabase
          .from('services')
          .update(dbRow)
          .eq('id', updated.id)
          .select()
          .maybeSingle();

        if (error) {
          console.error('[CMS] Supabase updateService error:', error);
          throw error;
        } else if (data) {
          const result = mapDbServiceToService(data);
          await this.syncToLocalStorage(result);
          return result;
        }
      } catch (err) {
        console.error('[CMS] updateService failed:', err);
        throw err;
      }
    }

    await this.syncToLocalStorage(updated);
    return updated;
  },

  /**
   * Delete a service (Admin operation).
   */
  async deleteService(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      try {
        await requireAdminSession();
        const { error } = await supabase
          .from('services')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('[CMS] Supabase deleteService error:', error);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        console.error('[CMS] deleteService error:', err);
        return { success: false, error: err.message || 'Error deleting service' };
      }
    }

    // Also remove from local cache
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
        if (raw) {
          const list: Service[] = JSON.parse(raw);
          const filtered = list.filter((s) => s.id !== id);
          localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(filtered));
        }
      }
    } catch {}

    return { success: true };
  },

  /**
   * Local storage synchronization helper.
   */
  async syncToLocalStorage(svc: Service): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
      const list: Service[] = raw ? JSON.parse(raw) : [...INITIAL_SERVICES];
      const idx = list.findIndex((s) => s.id === svc.id);
      if (idx >= 0) {
        list[idx] = svc;
      } else {
        list.push(svc);
      }
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(list));
    } catch {}
  },
};

// ============================================================================
// 2. SITE CONTENT CMS API (Generic Key-Value Section Blocks)
// ============================================================================

export const siteContentApi = {
  /**
   * Get a specific content block by key (e.g. 'general_settings', 'about_page', 'home_trust_pillars').
   */
  async getSiteContent<T = Record<string, any>>(key: string, defaultFallback: T): Promise<T> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('content')
          .eq('key', key)
          .maybeSingle();

        if (!error && data && data.content) {
          return { ...defaultFallback, ...data.content };
        } else if (error) {
          console.warn(`[CMS] getSiteContent(${key}) error, falling back:`, error.message);
        }
      } catch (err) {
        console.warn(`[CMS] getSiteContent(${key}) network error, falling back:`, err);
      }
    }

    // LocalStorage fallback by key
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(`solution4u_content_${key}`);
        if (raw) {
          return { ...defaultFallback, ...JSON.parse(raw) };
        }
      }
    } catch {}

    return defaultFallback;
  },

  /**
   * Fetch all site_content blocks in a single query.
   */
  async getAllSiteContent(): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, content');

        if (!error && data) {
          data.forEach((row) => {
            if (row.key && row.content) {
              result[row.key] = row.content;
            }
          });
          return result;
        }
      } catch (err) {
        console.warn('[CMS] getAllSiteContent error:', err);
      }
    }
    return result;
  },

  /**
   * Upsert a content block (Admin operation).
   */
  async upsertSiteContent(key: string, section: string, content: Record<string, any>): Promise<boolean> {
    // 1. Persist to Supabase site_content first when configured (requires Admin session)
    if (isSupabaseConfigured && supabase) {
      try {
        await requireAdminSession();
        const payload = {
          key,
          section,
          content,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('site_content')
          .upsert(payload, { onConflict: 'key' });

        if (error) {
          console.error(`[CMS] Supabase upsertSiteContent(${key}) error:`, error);
          return false;
        }
      } catch (err) {
        console.error(`[CMS] upsertSiteContent(${key}) exception:`, err);
        return false;
      }
    }

    // 2. Update local cache after authorization/persistence succeeds
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`solution4u_content_${key}`, JSON.stringify(content));
      }
    } catch {}

    return true;
  },

  /**
   * Delete a content block by key (Admin operation).
   */
  async deleteSiteContent(key: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await requireAdminSession();
        const { error } = await supabase
          .from('site_content')
          .delete()
          .eq('key', key);
        if (error) return false;
      } catch {
        return false;
      }
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`solution4u_content_${key}`);
      }
    } catch {}

    return true;
  },
};

// ============================================================================
// 3. INQUIRIES API (Consultation Submissions)
// ============================================================================

export const inquiriesApi = {
  /**
   * Submit a new customer inquiry.
   * Public visitors have INSERT access under RLS.
   */
  async createInquiry(inquiry: {
    fullName: string;
    phoneNumber: string;
    contactChannel: string;
    serviceType: string;
    message?: string;
  }): Promise<{ success: boolean; data?: ConsultationInquiry; error?: string }> {
    const normalizedChannel = (inquiry.contactChannel || 'messenger').trim().toLowerCase();
    const safeChannel = ALLOWED_INQUIRY_CHANNELS.has(normalizedChannel) ? normalizedChannel : 'messenger';

    const payload = {
      full_name: (inquiry.fullName || '').trim().slice(0, 120) || 'မိတ်ဆွေ',
      phone_number: (inquiry.phoneNumber || '').trim().slice(0, 40),
      contact_channel: safeChannel,
      service_type: (inquiry.serviceType || '').trim().slice(0, 150) || 'အထွေထွေ အကြံပေးမှု',
      message: (inquiry.message || '').trim().slice(0, 2000),
      status: 'new',
    };

    const createdRecord: ConsultationInquiry = {
      id: 'inq_' + Date.now(),
      fullName: payload.full_name,
      phoneNumber: payload.phone_number,
      contactChannel: payload.contact_channel as any,
      serviceType: payload.service_type,
      message: payload.message,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    // 1. Try Supabase INSERT (without .select() so anon users do not require SELECT RLS permission)
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('inquiries')
          .insert(payload);

        if (!error) {
          this.saveToLocalCache(createdRecord);
          return { success: true, data: createdRecord };
        } else {
          console.warn('[CMS] Supabase createInquiry notice:', error.message);
        }
      } catch (err: any) {
        console.warn('[CMS] createInquiry network notice, saving locally:', err);
      }
    }

    // 2. Fallback: Save to local storage so submission is never lost
    this.saveToLocalCache(createdRecord);
    return { success: true, data: createdRecord };
  },

  /**
   * Fetch all inquiries (Admin-only under RLS).
   */
  async getInquiries(): Promise<ConsultationInquiry[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        await requireAdminSession();
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[CMS] Supabase getInquiries error:', error);
          throw error;
        }

        if (data) {
          const mapped = data.map(mapDbInquiryToInquiry);
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(mapped));
            }
          } catch {}
          return mapped;
        }
      } catch (err) {
        console.error('[CMS] getInquiries admin error:', err);
        throw err;
      }
    }

    // Local fallback
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.INQUIRIES) : null;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Update inquiry status ('new' | 'contacted' | 'resolved') (Admin operation).
   */
  async updateInquiryStatus(id: string, status: 'new' | 'contacted' | 'resolved'): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      try {
        await requireAdminSession();
        const { error } = await supabase
          .from('inquiries')
          .update({ status })
          .eq('id', id);

        if (error) {
          console.error('[CMS] updateInquiryStatus error:', error);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        console.error('[CMS] updateInquiryStatus exception:', err);
        return { success: false, error: err.message || 'Status update failed' };
      }
    }

    // Local fallback update
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
        if (raw) {
          const list: ConsultationInquiry[] = JSON.parse(raw);
          const item = list.find((i) => i.id === id);
          if (item) {
            item.status = status;
            localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(list));
          }
        }
      }
    } catch {}

    return { success: true };
  },

  /**
   * Delete inquiry (Admin operation).
   */
  async deleteInquiry(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      try {
        await requireAdminSession();
        const { error } = await supabase
          .from('inquiries')
          .delete()
          .eq('id', id);
        if (error) {
          console.error('[CMS] deleteInquiry error:', error);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        console.error('[CMS] deleteInquiry exception:', err);
        return { success: false, error: err.message || 'Delete failed' };
      }
    }

    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
        if (raw) {
          const list: ConsultationInquiry[] = JSON.parse(raw);
          const filtered = list.filter((i) => i.id !== id);
          localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(filtered));
        }
      }
    } catch {}

    return { success: true };
  },

  saveToLocalCache(item: ConsultationInquiry): void {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      const list: ConsultationInquiry[] = raw ? JSON.parse(raw) : [];
      list.unshift(item);
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(list));
    } catch {}
  },
};

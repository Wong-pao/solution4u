import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Service } from '../../types';
import { INITIAL_CATEGORIES } from '../../data/initialData';
import { ServiceIcon } from '../ServiceIcon';
import { ImageUploadField } from './ImageUploadField';
import { deleteWebsiteMedia } from '../../lib/supabase';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  RotateCcw,
  Loader2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Tag,
  Hash,
  X,
  Sparkles,
  Check,
} from 'lucide-react';

// Predefined set of Lucide icon choices supported by ServiceIcon.tsx
const AVAILABLE_ICONS: { name: string; label: string }[] = [
  { name: 'Landmark', label: 'Landmark (ဘဏ်အကောင့်ဖွင့်ခြင်း)' },
  { name: 'Stethoscope', label: 'Stethoscope (ဆေးစစ်ခြင်း / စကားပြန်)' },
  { name: 'Building2', label: 'Building2 (အိမ်၊ ကွန်ဒို၊ အခန်းငှားရမ်းခြင်း)' },
  { name: 'Plane', label: 'Plane (လေယာဉ်လက်မှတ် / ဟိုတယ်)' },
  { name: 'Car', label: 'Car (လေဆိပ် အကြို/အပို့ / ယာဉ်မောင်း)' },
  { name: 'Compass', label: 'Compass (ဧည့်လမ်းညွှန် / ခရီးစဉ်)' },
  { name: 'CalendarClock', label: 'CalendarClock (90 Days Report ရက် ၉၀)' },
  { name: 'FileCheck2', label: 'FileCheck2 (TM.30 ဧည့်စာရင်းတိုင်ကြားခြင်း)' },
  { name: 'FileText', label: 'FileText (အလုပ်ထွက်စာ / အလုပ်ဝင်စာ / CI / PJ)' },
  { name: 'FileSearch', label: 'FileSearch (ဗီဇာစစ်ဆေးခြင်း)' },
  { name: 'RefreshCw', label: 'RefreshCw (ဗီဇာသက်တမ်းတိုးခြင်း)' },
  { name: 'Briefcase', label: 'Briefcase (Work Permit အလုပ်လုပ်ခွင့်)' },
  { name: 'HelpCircle', label: 'HelpCircle (အထွေထွေ အကူအညီ)' },
];

export const ServicesEditor: React.FC = () => {
  const { services, categories, createService, updateService, deleteService, reorderServices, navigateTo } = useApp();

  // Search & Filters for List view
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Editor mode: null (list view) | 'create' | 'edit'
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Form State
  const [formService, setFormService] = useState<Partial<Service>>({
    title: '',
    slug: '',
    shortDescription: '',
    detailedDescription: '',
    category: 'visa-immigration',
    iconName: 'Landmark',
    order: 1,
    isActive: true,
    coverImage: '',
  });

  // Baseline for dirty-state detection in Edit mode
  const [initialFormBaseline, setInitialFormBaseline] = useState<Partial<Service>>({});

  // Loading & Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Delete In-App Confirmation Modal state (NO window.confirm)
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Categories list for select
  const activeCategories = useMemo(() => {
    return categories && categories.length > 0 ? categories : INITIAL_CATEGORIES;
  }, [categories]);

  // Sorted services by display_order
  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [services]);

  // Filtered services for list view
  const filteredServices = useMemo(() => {
    return sortedServices.filter((svc) => {
      // Category filter
      if (categoryFilter !== 'all' && svc.category !== categoryFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === 'active' && !svc.isActive) return false;
      if (statusFilter === 'inactive' && svc.isActive) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = svc.title.toLowerCase().includes(q);
        const matchesSlug = svc.slug.toLowerCase().includes(q);
        const matchesShort = svc.shortDescription.toLowerCase().includes(q);
        const matchesDetail = svc.detailedDescription.toLowerCase().includes(q);
        return matchesTitle || matchesSlug || matchesShort || matchesDetail;
      }

      return true;
    });
  }, [sortedServices, categoryFilter, statusFilter, searchQuery]);

  // Dirty state tracking for the editor form
  const isFormDirty = useMemo(() => {
    if (editorMode === 'create') {
      return Boolean(
        formService.title?.trim() ||
        formService.slug?.trim() ||
        formService.shortDescription?.trim() ||
        formService.detailedDescription?.trim() ||
        formService.coverImage?.trim()
      );
    }
    if (editorMode === 'edit') {
      return JSON.stringify(formService) !== JSON.stringify(initialFormBaseline);
    }
    return false;
  }, [formService, initialFormBaseline, editorMode]);

  // Helper to slugify a string
  const generateSlugCandidate = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Open Create Mode
  const handleOpenCreate = () => {
    const nextOrder = (sortedServices.length > 0 ? Math.max(...sortedServices.map((s) => s.order || 0)) + 1 : 1);
    const newSvc: Partial<Service> = {
      title: '',
      slug: '',
      shortDescription: '',
      detailedDescription: '',
      category: 'visa-immigration',
      iconName: 'Landmark',
      order: nextOrder,
      isActive: true,
      coverImage: '',
    };
    setFormService(newSvc);
    setInitialFormBaseline(newSvc);
    setEditingServiceId(null);
    setEditorMode('create');
    setFeedbackError(null);
    setFeedbackSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Edit Mode
  const handleOpenEdit = (svc: Service) => {
    const copy = { ...svc };
    setFormService(copy);
    setInitialFormBaseline(copy);
    setEditingServiceId(svc.id);
    setEditorMode('edit');
    setFeedbackError(null);
    setFeedbackSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close Editor and return to list
  const handleCloseEditor = () => {
    setEditorMode(null);
    setEditingServiceId(null);
    setFormService({});
    setInitialFormBaseline({});
    setFeedbackError(null);
  };

  // Toggle Active / Inactive directly from list
  const handleToggleActive = async (svc: Service) => {
    setFeedbackError(null);
    try {
      const updated = { ...svc, isActive: !svc.isActive };
      await updateService(updated);
      setFeedbackSuccess(`"${svc.title}" ၏ အခြေအနေအား ${!svc.isActive ? 'Active (ဝက်ဘ်ဆိုက်ပေါ်တွင် ပြသထားသည်)' : 'Inactive (ဝှက်ထားသည်)'} သို့ ပြောင်းလဲပြီးပါပြီ`);
      setTimeout(() => setFeedbackSuccess(null), 3500);
    } catch (err: any) {
      console.error('[ServicesEditor] Toggle error:', err);
      setFeedbackError(err.message || 'အခြေအနေ ပြောင်းလဲရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    }
  };

  // Move service Up or Down
  const handleReorder = async (currentIndex: number, direction: 'up' | 'down') => {
    if (isReordering) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedServices.length) return;

    setIsReordering(true);
    setFeedbackError(null);

    try {
      const currentItem = sortedServices[currentIndex];
      const targetItem = sortedServices[targetIndex];

      // Swap their orders
      const currentOrder = currentItem.order || (currentIndex + 1);
      const targetOrder = targetItem.order || (targetIndex + 1);

      // If their orders happen to be identical, assign distinct sequential numbers
      const finalCurrentOrder = currentOrder === targetOrder ? targetOrder + (direction === 'up' ? 1 : -1) : targetOrder;
      const finalTargetOrder = currentOrder;

      const updatedCurrent = { ...currentItem, order: finalCurrentOrder };
      const updatedTarget = { ...targetItem, order: finalTargetOrder };

      await reorderServices([updatedCurrent, updatedTarget]);
      setFeedbackSuccess(`ဝန်ဆောင်မှု အစီအစဉ် (${currentItem.title}) ကို အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ`);
      setTimeout(() => setFeedbackSuccess(null), 3000);
    } catch (err: any) {
      console.error('[ServicesEditor] Reorder error:', err);
      setFeedbackError(err.message || 'အစီအစဉ် ပြောင်းလဲရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    } finally {
      setIsReordering(false);
    }
  };

  // Submit Add or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setFeedbackError(null);
    setFeedbackSuccess(null);

    // 1. Validation
    const title = formService.title?.trim();
    if (!title) {
      setFeedbackError('ဝန်ဆောင်မှု ခေါင်းစဉ် (Title) ကို ထည့်သွင်းပေးပါရန် လိုအပ်ပါသည်');
      return;
    }

    const rawSlug = formService.slug?.trim().toLowerCase();
    if (!rawSlug) {
      setFeedbackError('URL Slug ကို ထည့်သွင်းပေးပါရန် လိုအပ်ပါသည် (ဥပမာ- bank-account)');
      return;
    }

    // Slug regex validation (lowercase letters, numbers, hyphens only, no spaces)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(rawSlug)) {
      setFeedbackError('URL Slug သည် အင်္ဂလိပ်စာလုံးသေး၊ ဂဏန်းများနှင့် စာလုံးကြား တွဲဆက်မျဉ်း (-) သာ ခွင့်ပြုပါသည် (ဥပမာ- bank-account, tm-30)');
      return;
    }

    // Slug uniqueness check against existing services
    const isSlugDuplicate = services.some((s) => {
      if (editorMode === 'edit' && s.id === editingServiceId) {
        return false;
      }
      return s.slug.toLowerCase() === rawSlug;
    });

    if (isSlugDuplicate) {
      setFeedbackError(`ဤ URL Slug "${rawSlug}" ကို အခြားဝန်ဆောင်မှုတွင် အသုံးပြုထားပြီး ဖြစ်ပါသည်။ အခြား Slug တစ်ခု သတ်မှတ်ပေးပါရန် လိုအပ်ပါသည်`);
      return;
    }

    if (!formService.shortDescription?.trim()) {
      setFeedbackError('အကျဉ်းချုပ် ရှင်းလင်းချက် (Short Description) ကို ဖြည့်စွက်ပေးပါရန် လိုအပ်ပါသည်');
      return;
    }

    if (!formService.detailedDescription?.trim()) {
      setFeedbackError('အသေးစိတ် ဖော်ပြချက် (Detailed Description) ကို ဖြည့်စွက်ပေးပါရန် လိုအပ်ပါသည်');
      return;
    }

    if (!formService.category) {
      setFeedbackError('အမျိုးအစား (Category) ကို ရွေးချယ်ပေးပါရန် လိုအပ်ပါသည်');
      return;
    }

    if (!formService.iconName) {
      setFeedbackError('သင်္ကေတ Icon ကို ရွေးချယ်ပေးပါရန် လိုအပ်ပါသည်');
      return;
    }

    const orderNum = Number(formService.order);
    if (isNaN(orderNum) || orderNum < 1) {
      setFeedbackError('ပြသမည့် အစီအစဉ် (Display Order) သည် အနည်းဆုံး ၁ သို့မဟုတ် အပြုသဘောဆောင်သော ဂဏန်းဖြစ်ရပါမည်');
      return;
    }

    setIsSaving(true);

    try {
      if (editorMode === 'create') {
        const payload: Partial<Service> = {
          title: title,
          slug: rawSlug,
          shortDescription: formService.shortDescription.trim(),
          detailedDescription: formService.detailedDescription.trim(),
          category: formService.category,
          iconName: formService.iconName,
          order: orderNum,
          isActive: Boolean(formService.isActive),
          coverImage: formService.coverImage?.trim() || '',
        };

        const created = await createService(payload);
        setFeedbackSuccess(`ဝန်ဆောင်မှု အသစ် "${created.title}" ကို Supabase ပေါ်သို့ အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ!`);
        handleCloseEditor();
      } else if (editorMode === 'edit' && editingServiceId) {
        const updatedPayload: Service = {
          id: editingServiceId,
          title: title,
          slug: rawSlug,
          shortDescription: formService.shortDescription.trim(),
          detailedDescription: formService.detailedDescription.trim(),
          category: formService.category,
          iconName: formService.iconName,
          order: orderNum,
          isActive: Boolean(formService.isActive),
          coverImage: formService.coverImage?.trim() || '',
        };

        await updateService(updatedPayload);
        setFeedbackSuccess(`ဝန်ဆောင်မှု "${updatedPayload.title}" ၏ အချက်အလက်များကို Supabase တွင် အောင်မြင်စွာ ပြင်ဆင်သိမ်းဆည်းပြီးပါပြီ!`);
        handleCloseEditor();
      }

      setTimeout(() => setFeedbackSuccess(null), 4000);
    } catch (err: any) {
      console.error('[ServicesEditor] Save error:', err);
      // Friendly message for unique constraint errors from Supabase
      if (err.message && (err.message.includes('unique constraint') || err.message.includes('services_slug_key'))) {
        setFeedbackError(`ဤ URL Slug "${rawSlug}" ကို အခြားဝန်ဆောင်မှုတွင် အသုံးပြုထားပြီး ဖြစ်ပါသည်။ အခြား Slug တစ်ခု ရွေးပေးပါ`);
      } else {
        setFeedbackError(err.message || 'သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm and execute service deletion
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setFeedbackError(null);

    try {
      // Safely delete cover image from storage if stored in website-media
      if (deleteTarget.coverImage && deleteTarget.coverImage.includes('/website-media/')) {
        try {
          await deleteWebsiteMedia(deleteTarget.coverImage);
        } catch (cleanupErr) {
          console.warn('[ServicesEditor] Delete cover image notice:', cleanupErr);
        }
      }

      const res = await deleteService(deleteTarget.id);
      if (!res.success) {
        throw new Error(res.error || 'ဖျက်ရန် မအောင်မြင်ပါ');
      }
      setFeedbackSuccess(`"${deleteTarget.title}" ဝန်ဆောင်မှုကို Supabase database မှ အောင်မြင်စွာ ဖျက်ပြီးပါပြီ`);
      setDeleteTarget(null);
      setTimeout(() => setFeedbackSuccess(null), 4000);
    } catch (err: any) {
      console.error('[ServicesEditor] Delete error:', err);
      setFeedbackError(err.message || 'ဖျက်ရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner & Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-burmese">
                  Our Services Management (ဝန်ဆောင်မှုများ စီမံခန့်ခွဲခြင်း)
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 font-mono">
                  {services.length} Services
                </span>
              </div>
              <p className="text-xs text-slate-500 font-burmese">
                Supabase `public.services` ဇယားနှင့် တိုက်ရိုက်ချိတ်ဆက်၍ ဝန်ဆောင်မှု အသစ်ထည့်ခြင်း၊ ပြင်ဆင်ခြင်း၊ ဖျက်ခြင်းနှင့် Active အခြေအနေ သတ်မှတ်ခြင်း
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigateTo('services')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-burmese"
          >
            <span>Live ဝန်ဆောင်မှု စာမျက်နှာ</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {!editorMode && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-98 font-burmese cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ ဝန်ဆောင်မှု အသစ်ထည့်မည်</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Alerts / Feedback */}
      {feedbackSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-burmese shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{feedbackSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-0.5 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {feedbackError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between font-burmese shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{feedbackError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackError(null)}
            className="text-rose-700 hover:text-rose-900 font-bold px-2 py-0.5 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT FORM MODAL / PANEL */}
      {/* ========================================================================= */}
      {editorMode && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                {editorMode === 'create' ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-burmese">
                  {editorMode === 'create'
                    ? 'ဝန်ဆောင်မှု အသစ် ထည့်သွင်းခြင်း (Add New Service)'
                    : `"${initialFormBaseline.title || 'ဝန်ဆောင်မှု'}" အား ပြင်ဆင်ခြင်း`}
                </h3>
                <p className="text-xs text-slate-500 font-burmese">
                  {editorMode === 'create'
                    ? 'အချက်အလက်များကို ဖြည့်စွက်၍ Supabase Database ပေါ်သို့ တိုက်ရိုက် ထည့်သွင်းသိမ်းဆည်းပါမည်'
                    : 'အချက်အလက်များကို ပြင်ဆင်ပြီးပါက Save Changes ကို နှိပ်ပါ'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseEditor}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-6 font-burmese text-xs">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100">
                ၁။ အခြေခံ အချက်အလက်များ (Basic Information)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-7">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ဝန်ဆောင်မှု ခေါင်းစဉ် (Title) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formService.title || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormService((prev) => ({
                        ...prev,
                        title: val,
                        // Auto-populate slug only if creating new and user hasn't explicitly customized slug
                        slug: editorMode === 'create' && !prev.slug ? generateSlugCandidate(val) : prev.slug,
                      }));
                    }}
                    placeholder="ဥပမာ- ဘဏ်အကောင့် ဖွင့်လှစ်ပေးခြင်း"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
                  />
                </div>

                <div className="sm:col-span-5">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      URL Slug <span className="text-rose-500">*</span>
                    </label>
                    {formService.title && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormService((prev) => ({
                            ...prev,
                            slug: generateSlugCandidate(prev.title || ''),
                          }));
                        }}
                        className="text-[11px] text-sky-600 hover:underline"
                      >
                        Auto-generate
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                      /services/
                    </span>
                    <input
                      type="text"
                      required
                      value={formService.slug || ''}
                      onChange={(e) =>
                        setFormService((prev) => ({
                          ...prev,
                          slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                        }))
                      }
                      placeholder="bank-account"
                      className="w-full pl-22 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    အင်္ဂလိပ်စာလုံးသေး၊ ဂဏန်းနှင့် (-) မျဉ်းတိုသာ ထည့်ပါ
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ဝန်ဆောင်မှု အကျဉ်းချုပ် (Short Summary - ကတ်ပြားပေါ်တွင် ပြသမည့် အကျဉ်းချုပ်) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formService.shortDescription || ''}
                  onChange={(e) =>
                    setFormService((prev) => ({ ...prev, shortDescription: e.target.value }))
                  }
                  placeholder="ဥပမာ- ထိုင်းနိုင်ငံအတွင်း ဘဏ်အကောင့်ဖွင့်ရန် လိုအပ်သော အချက်အလက်များနှင့် လုပ်ငန်းစဉ်များကို အဆင်ပြေစွာ ကူညီပေးပါသည်။"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Service Card ပေါ်တွင် Image ၏ အောက်ခြေတွင် ပြသမည့် တိုတိုရှင်းရှင်း ၁–၂ ကြောင်း အကျဉ်းချုပ် စာသား ဖြစ်ပါသည်
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  အသေးစိတ် ဖော်ပြချက် (Detailed Description) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formService.detailedDescription || ''}
                  onChange={(e) =>
                    setFormService((prev) => ({ ...prev, detailedDescription: e.target.value }))
                  }
                  placeholder="ဝန်ဆောင်မှု အသေးစိတ် စာမျက်နှာတွင် ပြသမည့် အပြည့်အစုံ ရှင်းလင်းချက်၊ လိုအပ်ချက်များနှင့် ဆောင်ရွက်ပေးမည့် လုပ်ငန်းစဉ်များ..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
                />
              </div>
            </div>

            {/* Section 2: Classification & Icon */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100">
                ၂။ အမျိုးအစားနှင့် သင်္ကေတ (Classification & Icon)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    အမျိုးအစား (Category) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formService.category || 'visa-immigration'}
                    onChange={(e) => setFormService((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
                  >
                    {activeCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    သင်္ကေတ သင်္ကေတ (Lucide Icon) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100">
                      <ServiceIcon name={formService.iconName || 'HelpCircle'} className="w-5 h-5" />
                    </div>
                    <select
                      value={formService.iconName || 'Landmark'}
                      onChange={(e) => setFormService((prev) => ({ ...prev, iconName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
                    >
                      {AVAILABLE_ICONS.map((icon) => (
                        <option key={icon.name} value={icon.name}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Display & Visibility Status */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100">
                ၃။ ပြသမှုနှင့် အခြေအနေ (Display & Visibility)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ပြသမည့် အစီအစဉ် (Display Order) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formService.order || 1}
                    onChange={(e) =>
                      setFormService((prev) => ({ ...prev, order: parseInt(e.target.value, 10) || 1 }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    ဂဏန်းငယ်သော ဝန်ဆောင်မှုများသည် ဝက်ဘ်ဆိုက်တွင် ရှေ့ဆုံးမှ စတင်ပြသပါမည်
                  </span>
                </div>

                <div className="pt-2 sm:pt-4">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={Boolean(formService.isActive)}
                      onChange={(e) =>
                        setFormService((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        ဝက်ဘ်ဆိုက်ပေါ်တွင် တိုက်ရိုက်ပြသမည် (Active)
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        အမှန်ခြစ် ဖြုတ်ထားပါက ဝက်ဘ်ဆိုက် အများမြင်စာမျက်နှာများတွင် ခေတ္တ ဝှက်ထားပါမည်
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 4: Service Image */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100">
                ၄။ ဝန်ဆောင်မှု မျက်နှာဖုံး ဓာတ်ပုံ (Service Image)
              </h4>

              <ImageUploadField
                label="ဝန်ဆောင်မှု မျက်နှာဖုံး ဓာတ်ပုံ (Service Image)"
                value={formService.coverImage || ''}
                onChange={(url) => setFormService((prev) => ({ ...prev, coverImage: url }))}
                folder="services"
                recommendedSize="800 x 500 px (Landscape 16:10)"
                helpText="ဝက်ဘ်ဆိုက်၏ Service Card နှင့် အသေးစိတ် စာမျက်နှာတွင် အသုံးပြုမည့် မျက်နှာဖုံး ဓာတ်ပုံ ဖြစ်ပါသည်"
              />
            </div>

            {/* Section 5: Live Card Preview */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100 flex items-center justify-between">
                <span>၅။ Service Card အစမ်းပြသမှု (Live Card Preview)</span>
                <span className="text-[10px] text-slate-400 font-normal">ဝက်ဘ်ဆိုက်ပေါ်တွင် ပေါ်မည့်ပုံစံ</span>
              </h4>

              <div className="max-w-sm mx-auto bg-white rounded-2xl p-5 border border-slate-200 shadow-md">
                <div className="space-y-3.5">
                  {/* Header: Icon + Title */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                      <ServiceIcon name={formService.iconName || 'HelpCircle'} className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 font-burmese leading-snug truncate">
                        {formService.title || 'ဝန်ဆောင်မှု ခေါင်းစဉ်'}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        #{String(formService.order || 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Image with Short Summary overlay (or fallback) */}
                  {formService.coverImage ? (
                    <div className="w-full aspect-[16/10] rounded-xl overflow-hidden relative border border-slate-200/80 bg-slate-900 shadow-2xs">
                      <img
                        src={formService.coverImage}
                        alt="Preview"
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          const container = e.currentTarget.parentElement;
                          if (container) container.style.display = 'none';
                        }}
                      />
                      {/* Subtle soft gradient base behind the floating panel */}
                      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-slate-950/25 to-transparent pointer-events-none" />

                      {/* Premium Floating Glass Summary Panel - Short Summary ONLY */}
                      <div className="absolute inset-x-2.5 bottom-2.5 sm:inset-x-3.5 sm:bottom-3.5 p-2.5 sm:p-3 rounded-xl bg-[#0c2340]/80 backdrop-blur-md border border-white/20 shadow-md shadow-sky-950/25 pointer-events-none">
                        <p className="text-xs sm:text-[13px] text-white/95 font-medium leading-relaxed font-burmese line-clamp-2">
                          {formService.shortDescription || 'အကျဉ်းချုပ် စာကြောင်း (Short Summary) ဤနေရာတွင် ပြသပါမည်...'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 shadow-2xs">
                      <p className="text-xs text-slate-600 font-medium leading-relaxed font-burmese line-clamp-2">
                        {formService.shortDescription || 'ဓာတ်ပုံ မထည့်သွင်းထားပါက အကျဉ်းချုပ် စာကြောင်းကို သီးသန့် အကွက်ဖြင့် ပြသပါမည်'}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-burmese">
                    <span className="font-semibold text-sky-700">အသေးစိတ်ကြည့်ရန် →</span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg">တိုင်ပင်ရန်</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleCloseEditor}
                disabled={isSaving}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-burmese cursor-pointer"
              >
                မလုပ်တော့ပါ (Cancel)
              </button>

              <div className="flex items-center gap-3">
                {editorMode === 'edit' && isFormDirty && (
                  <button
                    type="button"
                    onClick={() => setFormService({ ...initialFormBaseline })}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-burmese"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>မူလအတိုင်း ပြန်ထားမည်</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSaving || (editorMode === 'edit' && !isFormDirty)}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs font-burmese ${
                    editorMode === 'edit' && !isFormDirty
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer active:scale-98 shadow-sky-600/20'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>သိမ်းဆည်းနေပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        {editorMode === 'create' ? 'ဝန်ဆောင်မှု အသစ် သိမ်းဆည်းမည်' : 'ပြင်ဆင်ချက်များ သိမ်းဆည်းမည်'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SERVICES LIST VIEW */}
      {/* ========================================================================= */}
      {!editorMode && (
        <div className="space-y-4">
          {/* Search & Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 font-burmese text-xs">
            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ရှာဖွေရန် (ခေါင်းစဉ်၊ Slug၊ အကျဉ်းချုပ်)..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills / Selects */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 outline-hidden focus:border-sky-500"
              >
                <option value="all">အမျိုးအစား အားလုံး ({services.length})</option>
                {activeCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  အားလုံး ({sortedServices.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    statusFilter === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active ({sortedServices.filter((s) => s.isActive).length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    statusFilter === 'inactive' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Inactive ({sortedServices.filter((s) => !s.isActive).length})
                </button>
              </div>
            </div>
          </div>

          {/* Services List Table / Cards */}
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center font-burmese space-y-3">
              <p className="text-slate-500 text-sm">ရှာဖွေမှုနှင့် ကိုက်ညီသော ဝန်ဆောင်မှု မရှိပါ</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
                className="text-xs text-sky-600 hover:underline font-semibold"
              >
                Filter အားလုံး ပြန်လည်ရှင်းလင်းမည်
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredServices.map((svc, index) => {
                const categoryObj = activeCategories.find((c) => c.id === svc.category);
                const isFirst = index === 0;
                const isLast = index === filteredServices.length - 1;

                return (
                  <div
                    key={svc.id}
                    className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      svc.isActive
                        ? 'border-slate-200/90 shadow-xs hover:border-slate-300'
                        : 'border-slate-200 bg-slate-50/70 opacity-80'
                    }`}
                  >
                    {/* Left: Icon, Number, Title, Slug, Category, Description */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Order and Icon */}
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                            svc.isActive
                              ? 'bg-sky-50 text-sky-700 border-sky-100'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                        >
                          <ServiceIcon name={svc.iconName} className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          #{String(svc.order || index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 font-burmese leading-snug">
                            {svc.title}
                          </h4>

                          {/* Status Badge */}
                          {svc.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-burmese">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 font-burmese">
                              <EyeOff className="w-3 h-3 text-slate-400" />
                              Hidden (ဝှက်ထားသည်)
                            </span>
                          )}

                          {/* Category Badge */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 font-burmese">
                            <Tag className="w-2.5 h-2.5 text-slate-400" />
                            {categoryObj?.name || svc.category}
                          </span>

                          {/* Image indicator badge */}
                          {svc.coverImage ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 font-burmese">
                              <ImageIcon className="w-2.5 h-2.5 text-sky-600" />
                              ဓာတ်ပုံရှိသည်
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-400 font-burmese">
                              <ImageIcon className="w-2.5 h-2.5 text-slate-400" />
                              ဓာတ်ပုံမရှိသေးပါ
                            </span>
                          )}
                        </div>

                        {/* URL Slug */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                          <span>slug:</span>
                          <span className="text-slate-600 hover:text-sky-700">/services/{svc.slug}</span>
                        </div>

                        {/* Short Description */}
                        <p className="text-xs text-slate-600 font-burmese line-clamp-2 leading-relaxed">
                          {svc.shortDescription}
                        </p>
                      </div>

                      {/* Cover image thumbnail (desktop/tablet) */}
                      {svc.coverImage && (
                        <div className="hidden sm:block w-14 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 self-center">
                          <img
                            src={svc.coverImage}
                            alt={svc.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {/* Reorder Buttons */}
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleReorder(index, 'up')}
                          disabled={isFirst || isReordering}
                          title="အပေါ်သို့ ရွှေ့မည်"
                          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-[1px] h-4 bg-slate-200"></div>
                        <button
                          type="button"
                          onClick={() => handleReorder(index, 'down')}
                          disabled={isLast || isReordering}
                          title="အောက်သို့ ရွှေ့မည်"
                          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Active Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(svc)}
                        title={svc.isActive ? 'ဝက်ဘ်ဆိုက်မှ ဝှက်ထားမည်' : 'ဝက်ဘ်ဆိုက်တွင် ပြသမည်'}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          svc.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {svc.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(svc)}
                        title="ပြင်ဆင်မည်"
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded-xl transition-colors font-burmese cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>ပြင်ဆင်မည်</span>
                      </button>

                      {/* Delete Button (with in-app modal confirmation) */}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(svc)}
                        title="ဖျက်မည်"
                        className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* IN-APP CONFIRMATION MODAL FOR DELETION (NO window.confirm) */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-burmese">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                ဝန်ဆောင်မှု ဖျက်ရန် သေချာပါသလား?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                သင်သည် <span className="font-bold text-slate-900">"{deleteTarget.title}"</span> (Slug: {deleteTarget.slug}) အား Supabase database မှ အပြီးပိုင် ဖျက်တော့မည် ဖြစ်ပါသည်။
              </p>
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                သတိပြုရန်- ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြင်ဆင်၍ မရနိုင်ပါ။ ဖျက်ပြီးပါက ဝက်ဘ်ဆိုက်ပေါ်တွင်လည်း ဖော်ပြတော့မည် မဟုတ်ပါ။
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                မဖျက်တော့ပါ (Cancel)
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ဖျက်နေပါသည်...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>ဖျက်မည် (Delete)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

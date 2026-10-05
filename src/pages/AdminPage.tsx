import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Post, Service, SiteSettings } from '../types';
import {
  SUPABASE_SQL_SCHEMA,
  isSupabaseConfigured,
  uploadPostImage,
  migrateLocalPostsToSupabase,
  generateUuid
} from '../lib/supabase';
import { generateClientSideSourceZip } from '../lib/projectExporter';
import { GlobalSettingsEditor } from '../components/admin/GlobalSettingsEditor';
import { HomePageEditor } from '../components/admin/HomePageEditor';
import { AboutPageEditor } from '../components/admin/AboutPageEditor';
import { ServicesEditor } from '../components/admin/ServicesEditor';
import { InquiriesInbox } from '../components/admin/InquiriesInbox';
import { StaticContentEditor } from '../components/admin/StaticContentEditor';
import { ContactPageEditor } from '../components/admin/ContactPageEditor';
import {
  ShieldCheck,
  Lock,
  LogOut,
  FileText,
  Settings,
  Layers,
  Database,
  Plus,
  Trash2,
  Edit,
  Check,
  Copy,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Type,
  Share2,
  Eye,
  RefreshCw,
  ExternalLink,
  KeyRound,
  Download,
  CheckCircle,
  AlertCircle,
  X,
  Building2,
  Phone,
  Info,
  Home,
  Inbox
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const {
    isAdminLoggedIn,
    adminUserEmail,
    loginAdmin,
    logoutAdmin,
    posts,
    savePost,
    deletePost,
    services,
    updateService,
    settings,
    updateSettings,
    categories,
    navigateTo,
    refreshData
  } = useApp();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'home-page' | 'about-us' | 'our-services' | 'posts' | 'new-post' | 'contact-us' | 'global-settings' | 'static-content' | 'inquiries' | 'database'
  >('home-page');

  // Editing state for posts
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // New post form state
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('/src/assets/images/hero_bangkok_community_1790239728277.jpg');
  const [formCategory, setFormCategory] = useState(categories[0]?.id || 'visa-immigration');
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('published');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formReadTime, setFormReadTime] = useState(4);
  const [formTags, setFormTags] = useState('ဗီဇာ, စာရွက်စာတမ်း, ဘန်ကောက်');

  // Facebook post quick-import helper modal/panel
  const [fbImportText, setFbImportText] = useState('');
  const [showFbImport, setShowFbImport] = useState(false);

  // Schema copy status
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Client-side ZIP Export States
  const [isExportingClientZip, setIsExportingClientZip] = useState(false);
  const [exportProgressText, setExportProgressText] = useState('');
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);
  const [downloadErrorMsg, setDownloadErrorMsg] = useState<string | null>(null);
  const [copiedDirectLink, setCopiedDirectLink] = useState(false);

  // Supabase Cover Image Upload & Post Save states
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadSuccess, setCoverUploadSuccess] = useState<string | null>(null);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [postSaveSuccess, setPostSaveSuccess] = useState<string | null>(null);
  const [postSaveError, setPostSaveError] = useState<string | null>(null);

  // Delete Confirmation & Execution states
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeletingPost(true);
    setDeleteErrorMsg(null);
    setDeleteSuccessMsg(null);

    try {
      const result = await deletePost(postToDelete.id);
      if (result.imageWarning) {
        setDeleteSuccessMsg(`ဆောင်းပါးကို အောင်မြင်စွာ ဖျက်ပြီးပါပြီ (သတိပေးချက်: ${result.imageWarning})`);
      } else {
        setDeleteSuccessMsg(`"${postToDelete.title}" ဆောင်းပါးနှင့် သက်ဆိုင်ရာ Storage ပုံကို အောင်မြင်စွာ ဖျက်ပြီးပါပြီ`);
      }
      setTimeout(() => setDeleteSuccessMsg(null), 5000);
      setPostToDelete(null);
    } catch (err: any) {
      console.error('Delete post failed:', err);
      setDeleteErrorMsg(err.message || 'ဆောင်းပါး ဖျက်ရာတွင် အမှားဖြစ်ပွားခဲ့ပါသည်။');
    } finally {
      setIsDeletingPost(false);
    }
  };

  // Supabase Migration states
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);

  const handleRunMigration = async () => {
    setIsMigrating(true);
    setMigrationStatus('Local Posts များကို Supabase သို့ ကူးယူနေပါသည်...');
    try {
      const result = await migrateLocalPostsToSupabase();
      setMigrationStatus(result.message);
      await refreshData();
    } catch (err: any) {
      setMigrationStatus(`Migration မအောင်မြင်ပါ: ${err.message || 'Unknown error'}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleClientSideZipDownload = async () => {
    setIsExportingClientZip(true);
    setDownloadSuccessMsg(null);
    setDownloadErrorMsg(null);
    try {
      const blob = await generateClientSideSourceZip((msg) => setExportProgressText(msg));
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'solution4u-source-code.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 4000);
      setDownloadSuccessMsg(`Source Code ZIP အောင်မြင်စွာ ထုတ်ယူပြီးပါပြီ (${(blob.size / (1024 * 1024)).toFixed(1)} MB)`);
    } catch (err: any) {
      console.error('JSZip generation failed:', err);
      setDownloadErrorMsg('ZIP ထုတ်ပိုးရာတွင် အမှားဖြစ်သွားပါသည်။ New Tab Link ဖြင့် ဒေါင်းလုဒ်ဆွဲပေးပါ။');
    } finally {
      setIsExportingClientZip(false);
      setExportProgressText('');
    }
  };

  const handleOpenDirectInNewTab = (filename: string) => {
    const fullUrl = `${window.location.origin}/${filename}`;
    window.open(fullUrl, '_blank');
  };

  const directSourceUrl = typeof window !== 'undefined' ? `${window.location.origin}/solution-for-you-source.zip` : '';


  // Handle Admin Login with Supabase Auth (or offline fallback)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginErrorMessage(null);
    try {
      const res = await loginAdmin({
        email: emailInput.trim(),
        password: passwordInput,
      });

      if (!res.success) {
        setLoginErrorMessage(res.error || 'အကောင့်ဝင်ရောက်မှု မအောင်မြင်ပါ။');
      } else {
        setEmailInput('');
        setPasswordInput('');
      }
    } catch (err: any) {
      setLoginErrorMessage(err.message || 'အကောင့်ဝင်ရောက်မှု မအောင်မြင်ပါ။');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleStartEdit = (post: Post) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormExcerpt(post.excerpt);
    setFormContent(post.content);
    setFormCoverImage(post.coverImage);
    setFormCategory(post.categoryId);
    setFormStatus(post.status);
    setFormIsFeatured(post.isFeatured ?? false);
    setFormReadTime(post.readTimeMinutes || 4);
    setFormTags(post.tags?.join(', ') || '');
    setActiveTab('new-post');
  };

  const handleResetForm = () => {
    setEditingPost(null);
    setFormTitle('');
    setFormSlug('');
    setFormExcerpt('');
    setFormContent('');
    setFormCoverImage('/src/assets/images/hero_bangkok_community_1790239728277.jpg');
    setFormCategory(categories[0]?.id || 'visa-immigration');
    setFormStatus('published');
    setFormIsFeatured(false);
    setFormReadTime(4);
    setFormTags('ဗီဇာ, စာရွက်စာတမ်း');
  };

  // Helper for blog post cover upload -> Supabase Storage (blog-images) or local preview fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'postCover' = 'postCover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (targetField === 'postCover') {
      setCoverUploadError(null);
      setCoverUploadSuccess(null);

      // 1. Validate allowed file extension and MIME type (JPG, JPEG, PNG, WEBP only; block SVG/HTML/executable files)
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.type)) {
        setCoverUploadError('JPG, PNG သို့မဟုတ် WEBP ဓာတ်ပုံဖိုင်များသာ တင်ခွင့်ပြုပါသည် (Allowed: JPG, PNG, WEBP)');
        e.target.value = '';
        return;
      }

      // 2. Validate file size (<= 5 MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        setCoverUploadError('ဓာတ်ပုံဖိုင်အရွယ်အစားသည် 5 MB ထက်မကျော်လွန်ရပါ (Max size: 5MB)');
        e.target.value = '';
        return;
      }

      if (isSupabaseConfigured) {
        setIsUploadingCover(true);
        try {
          const publicUrl = await uploadPostImage(file);
          setFormCoverImage(publicUrl);
          setCoverUploadSuccess('Supabase Storage ("blog-images") သို့ ပုံတင်ပြီးပါပြီ');
          setTimeout(() => setCoverUploadSuccess(null), 4000);
        } catch (err: any) {
          console.error('Supabase Storage upload notice:', err);
          setCoverUploadError(`Supabase Storage သို့ ပုံတင်မရပါ (${err.message || 'Error'})`);
        } finally {
          setIsUploadingCover(false);
          e.target.value = '';
        }
        return;
      }

      // If Supabase not yet configured, local preview for validated image
      const reader = new FileReader();
      reader.onload = () => {
        setFormCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  // Facebook post quick-import parser
  const handleApplyFbImport = () => {
    if (!fbImportText.trim()) return;

    const lines = fbImportText.trim().split('\n');
    const firstLine = lines[0].replace(/^[#*-]\s*/, '').trim();
    const remainingText = lines.slice(1).join('\n').trim();

    setFormTitle(firstLine.slice(0, 100));
    setFormExcerpt(remainingText.slice(0, 160) || firstLine);
    setFormContent(remainingText || firstLine);
    setShowFbImport(false);
    setFbImportText('');
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSavingPost(true);
    setPostSaveError(null);

    const generatedSlug =
      formSlug.trim() ||
      formTitle
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 40) ||
      'post-' + Date.now();

    const postToSave: Post = {
      id: editingPost ? editingPost.id : generateUuid(),
      title: formTitle.trim(),
      slug: generatedSlug,
      excerpt: formExcerpt.trim(),
      content: formContent.trim(),
      coverImage: formCoverImage.trim(),
      categoryId: formCategory,
      author: 'Solution for You Team',
      status: formStatus,
      publishedAt: editingPost ? editingPost.publishedAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      seoTitle: formTitle.trim() + ' | Solution for You',
      seoDescription: formExcerpt.trim(),
      tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
      isFeatured: formIsFeatured,
      readTimeMinutes: Number(formReadTime) || 4,
    };

    try {
      await savePost(postToSave);
      setPostSaveSuccess(
        isSupabaseConfigured
          ? 'ဆောင်းပါးကို Supabase Cloud Database ပေါ်သို့ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!'
          : 'ဆောင်းပါးကို LocalStorage ထဲသို့ သိမ်းဆည်းပြီးပါပြီ (Local Fallback Mode)'
      );
      handleResetForm();
      setActiveTab('posts');
      setTimeout(() => setPostSaveSuccess(null), 4000);
    } catch (err: any) {
      console.error('Failed to save post:', err);
      setPostSaveError(`ဆောင်းပါးသိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ပါသည်: ${err.message || 'Error'}`);
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  // If not logged in, show Login gate
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl max-w-md w-full space-y-6 text-center">
          <div className="w-16 h-16 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-bold mb-2">
              <ShieldCheck className="w-3 h-3 text-sky-600" />
              <span>{isSupabaseConfigured ? 'Supabase Auth Protected' : 'Supabase Not Configured'}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Admin Portal Login</h1>
            <p className="text-xs text-slate-500 mt-1 font-burmese">
              စာသားများ၊ ဆောင်းပါးများ၊ Logo နှင့် Facebook ပုံများ စီမံရန်
            </p>
          </div>

          {loginErrorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-left font-burmese flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{loginErrorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin အီးမေးလ် (Email)
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin စကားဝှက် (Password)
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="စကားဝှက် ရိုက်ထည့်ပါ..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl transition-colors shadow-xs disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>အကောင့်စစ်ဆေးနေပါသည်...</span>
                </>
              ) : (
                <span>အကောင့်ဝင်မည်</span>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-400">
            {isSupabaseConfigured ? (
              <p className="font-burmese text-[11px] text-slate-500">
                💡 Supabase Dashboard &gt; Authentication &gt; Users တွင် ဖန်တီးထားသော Admin အကောင့်ဖြင့် ဝင်ရောက်ပါ
              </p>
            ) : (
              <p className="text-[11px] text-rose-500 font-medium font-sans">
                ⚠️ Supabase Authentication is not configured. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900">Solution for You — Management Studio</h1>
            <p className="text-xs text-slate-500 font-burmese">
              Contents တင်ရန် · စာသားများ ပြင်ဆင်ရန် · Logo & Facebook စီမံရန်
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {adminUserEmail && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[180px]">{adminUserEmail}</span>
            </span>
          )}

          <button
            onClick={() => navigateTo('home')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-burmese"
          >
            ဝက်ဘ်ဆိုက် ကြည့်ရှုမည်
          </button>

          <button
            onClick={logoutAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ထွက်မည်</span>
          </button>
        </div>
      </div>

      {/* Reorganized Admin Navigation (Grouped by Website Content, Website Settings, Management, Advanced/Technical) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4 font-burmese">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Group 1: WEBSITE CONTENT (1 - 5) */}
          <div className="lg:col-span-7 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono px-1">
              Website Content (ပင်မ စာမျက်နှာ ၅ ခု)
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('home-page')}
                className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'home-page'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>၁။ Home Page</span>
              </button>

              <button
                onClick={() => setActiveTab('about-us')}
                className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'about-us'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>၂။ About Us</span>
              </button>

              <button
                onClick={() => setActiveTab('our-services')}
                className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'our-services'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>၃။ Our Services</span>
              </button>

              <button
                onClick={() => setActiveTab('posts')}
                className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'posts' || activeTab === 'new-post'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>၄။ Contents ({posts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('contact-us')}
                className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'contact-us'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>၅။ Contact Us</span>
              </button>
            </div>
          </div>

          {/* Group 2: WEBSITE SETTINGS (6 - 7) & Group 3: MANAGEMENT (8) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-4">
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono px-1">
                Website Settings
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('global-settings')}
                  className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'global-settings'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>၆။ Global Settings</span>
                </button>

                <button
                  onClick={() => setActiveTab('static-content')}
                  className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'static-content'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>၇။ Static Page Content</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono px-1">
                Management
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('inquiries')}
                  className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'inquiries'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>၈။ Inquiries</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Group 4: ADVANCED / TECHNICAL (9) - Visually separated at the bottom */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono px-1">
            Advanced / Technical
          </div>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer ${
              activeTab === 'database'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>၉။ Supabase SQL</span>
          </button>
        </div>
      </div>

      {/* Tab 1: POSTS LIST */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {postSaveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-burmese shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{postSaveSuccess}</span>
              </div>
              <button
                onClick={() => setPostSaveSuccess(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs underline font-sans"
              >
                Dismiss
              </button>
            </div>
          )}

          {deleteSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-burmese flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{deleteSuccessMsg}</span>
              </div>
              <button
                onClick={() => setDeleteSuccessMsg(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          )}

          {deleteErrorMsg && !postToDelete && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-burmese flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{deleteErrorMsg}</span>
              </div>
              <button
                onClick={() => setDeleteErrorMsg(null)}
                className="text-rose-700 hover:text-rose-900 text-xs font-bold px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-burmese">
              ထုတ်ဝေထားသော Contents & ဆောင်းပါးများ
            </h2>
            <button
              onClick={() => {
                handleResetForm();
                setActiveTab('new-post');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs font-burmese"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Content အသစ် ရေးမည်</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-mono uppercase">
                  <tr>
                    <th className="py-3 px-4">Cover</th>
                    <th className="py-3 px-4">Title / ခေါင်းစဉ်</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 w-16">
                        <img
                          src={post.coverImage}
                          alt=""
                          className="w-12 h-8 rounded-md object-cover bg-slate-100 border border-slate-200"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 font-burmese max-w-sm">
                        <div className="flex items-center gap-2">
                          {post.isFeatured && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded-sm font-bold">
                              Featured
                            </span>
                          )}
                          <span className="truncate">{post.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">{post.categoryId}</td>
                      <td className="py-3.5 px-4 text-slate-500">{post.publishedAt}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            post.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => navigateTo('blog-detail', post.slug)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                          title="View post"
                        >
                          <Eye className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleStartEdit(post)}
                          className="p-1 text-sky-600 hover:text-sky-800"
                          title="Edit post"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteErrorMsg(null);
                            setPostToDelete(post);
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700 transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-burmese">
                    ဆောင်းပါး ဖျက်ရန် အတည်ပြုပါ
                  </h3>
                  <p className="text-xs text-slate-500 font-burmese">
                    ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြင်ဆင်၍ မရပါ
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isDeletingPost) {
                    setPostToDelete(null);
                    setDeleteErrorMsg(null);
                  }
                }}
                disabled={isDeletingPost}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              {postToDelete.coverImage && (
                <img
                  src={postToDelete.coverImage}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover bg-slate-200 shrink-0 border border-slate-200"
                />
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 font-burmese truncate">
                  {postToDelete.title}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Category: {postToDelete.categoryId}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 font-burmese space-y-1.5 bg-rose-50/50 p-3 rounded-xl border border-rose-100/70">
              <p className="flex items-center gap-1.5 text-slate-700">
                <span>• Supabase Database (</span><code className="font-mono text-slate-900 font-semibold bg-white px-1 py-0.5 rounded text-[11px]">public.posts</code><span>) မှ ဖျက်ပါမည်။</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-700">
                <span>• Supabase Storage (</span><code className="font-mono text-slate-900 font-semibold bg-white px-1 py-0.5 rounded text-[11px]">blog-images</code><span>) ပုံကိုပါ ရှင်းလင်းပါမည်။</span>
              </p>
            </div>

            {deleteErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-burmese flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{deleteErrorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeletingPost}
                onClick={() => {
                  setPostToDelete(null);
                  setDeleteErrorMsg(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors font-burmese disabled:opacity-50"
              >
                မဖျက်တော့ပါ
              </button>
              <button
                type="button"
                disabled={isDeletingPost}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors font-burmese flex items-center gap-1.5 shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {isDeletingPost ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>ဖျက်နေပါသည်...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>အမှန်တကယ် ဖျက်မည်</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CREATE / EDIT POST WITH IMAGE UPLOAD & FB QUICK-IMPORTER */}
      {activeTab === 'new-post' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-burmese">
                {editingPost ? 'Content ပြင်ဆင်ရန်' : 'Content အသစ် တင်ရန်'}
              </h2>
              <p className="text-xs text-slate-500 font-burmese">
                ဖုန်း/ကွန်ပျူတာမှ ဓာတ်ပုံရွေးချယ်ပြီး မိမိရေးချင်သော မြန်မာစာသားများနှင့် တွဲတင်နိုင်ပါသည်
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFbImport(!showFbImport)}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold font-burmese flex items-center gap-1.5 border border-blue-200 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Facebook Post မှ ကူးထည့်မည်</span>
              </button>
              {editingPost && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-burmese"
                >
                  အသစ်ရေးမည်
                </button>
              )}
            </div>
          </div>

          {/* Facebook Post Quick Importer Box */}
          {showFbImport && (
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3 font-burmese animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950">
                  Facebook Post စာသားကို ဤနေရာတွင် Paste လုပ်ပါ (ကူးထည့်ပါ)
                </span>
                <button
                  onClick={() => setShowFbImport(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <textarea
                rows={4}
                value={fbImportText}
                onChange={(e) => setFbImportText(e.target.value)}
                placeholder="Facebook Page ပေါ်တွင် တင်ခဲ့သော စာသားကို အစအဆုံး ကူးထည့်ပါ..."
                className="w-full p-3 rounded-lg border border-blue-200 bg-white text-xs outline-hidden resize-none"
              />
              <button
                type="button"
                onClick={handleApplyFbImport}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Auto ဖြည့်သွင်းမည် (Auto Fill Title & Content)
              </button>
            </div>
          )}

          <form onSubmit={handleSavePost} className="space-y-5 font-burmese text-sm">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ဆောင်းပါး ခေါင်းစဉ် (Title) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="ဥပမာ - ဘော်တော် ၆၂ ကိုင်ထားသူများ သတိပြုရမည့် အချက်များ"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-sm"
              />
            </div>

            {/* Category and Read Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category (ကဏ္ဍ)
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ဖတ်ရှုချိန် (မိနစ်)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formReadTime}
                  onChange={(e) => setFormReadTime(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status (အခြေအနေ)
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="published">Published (လူထုသို့ ထုတ်ဝေမည်)</option>
                  <option value="draft">Draft (မူကြမ်း)</option>
                </select>
              </div>
            </div>

            {/* Cover Image Uploader & Preview */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  ဆောင်းပါး မျက်နှာဖုံးဓာတ်ပုံ (Cover Photo)
                </label>
                <span className="text-[11px] text-slate-500">
                  {isSupabaseConfigured
                    ? '☁️ Supabase Storage ("blog-images") သို့ တိုက်ရိုက် Upload လုပ်ပေးပါသည်'
                    : 'Device ပေါ်မှ ပုံရွေးချယ်နိုင်ပါသည်'}
                </span>
              </div>

              {/* Upload state indicators */}
              {isUploadingCover && (
                <div className="p-2.5 rounded-xl bg-sky-100/70 border border-sky-200 text-sky-800 text-xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
                  <span>Supabase Storage ("blog-images") သို့ ပုံတင်နေပါသည်...</span>
                </div>
              )}
              {coverUploadSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{coverUploadSuccess}</span>
                </div>
              )}
              {coverUploadError && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{coverUploadError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {formCoverImage && (
                  <img
                    src={formCoverImage}
                    alt="Cover preview"
                    className="w-32 h-20 object-cover rounded-xl border border-slate-200 shadow-xs"
                  />
                )}

                <div className="space-y-2 flex-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-sky-600" />
                    <span>{isUploadingCover ? 'Uploading...' : 'ဖုန်း/ကွန်ပျူတာမှ ဓာတ်ပုံရွေးချယ်မည်'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isUploadingCover}
                      onChange={(e) => handleFileUpload(e, 'postCover')}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">သို့မဟုတ် Image URL ထည့်ပါ:</span>
                    <input
                      type="text"
                      value={formCoverImage}
                      onChange={(e) => setFormCoverImage(e.target.value)}
                      placeholder="/src/assets/... or https://..."
                      className="flex-1 px-3 py-1 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                အကျဉ်းချုပ် (Excerpt)
              </label>
              <textarea
                rows={2}
                value={formExcerpt}
                onChange={(e) => setFormExcerpt(e.target.value)}
                placeholder="စာဖတ်သူ ချက်ချင်းသိနိုင်မည့် အကျဉ်းချုပ် စာသား..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs resize-none"
              />
            </div>

            {/* Content Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ဆောင်းပါး အပြည့်အစုံ (Body Content)
              </label>
              <textarea
                rows={10}
                required
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="ဆောင်းပါး အပြည့်အစုံကို စိတ်တိုင်းကျ ရေးသားနိုင်ပါသည်။ (ဥပမာ ### ခေါင်းစဉ်ခွဲ, ### ⚠️ သတိပြုရန်, - စာရင်း)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-sans leading-relaxed"
              />
            </div>

            {/* Tags & Featured */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tags (ကော်မာခြားပါ)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="ဗီဇာ, Work Permit, ထိုင်းဥပဒေ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded"
                />
                <label htmlFor="featuredCheck" className="text-xs font-semibold text-slate-700">
                  Featured (အထူးဆောင်းပါး အဖြစ် တင်မည်)
                </label>
              </div>
            </div>

            {postSaveError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{postSaveError}</span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                disabled={isSavingPost}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-50"
              >
                မသိမ်းဘဲ ပြန်ထွက်မည်
              </button>
              <button
                type="submit"
                disabled={isSavingPost || isUploadingCover}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-60 flex items-center gap-2 cursor-pointer"
              >
                {isSavingPost ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>သိမ်းဆည်းနေပါသည်...</span>
                  </>
                ) : (
                  <span>{editingPost ? 'ပြင်ဆင်ချက် သိမ်းဆည်းမည်' : 'ဆောင်းပါး အသစ် တင်မည်'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 5: CONTACT US CMS */}
      {activeTab === 'contact-us' && (
        <ContactPageEditor />
      )}

      {/* Tab 6: GLOBAL SETTINGS (STAGE 3A CMS) */}
      {activeTab === 'global-settings' && (
        <GlobalSettingsEditor />
      )}

      {/* Tab 2: ABOUT US (STAGE 3C CMS) */}
      {activeTab === 'about-us' && (
        <AboutPageEditor />
      )}

      {/* Tab 1: HOME PAGE (STAGE 3B CMS) */}
      {activeTab === 'home-page' && (
        <HomePageEditor />
      )}

      {/* Tab 3: OUR SERVICES (STAGE 3D CMS) */}
      {activeTab === 'our-services' && (
        <ServicesEditor />
      )}

      {/* Tab 8: INQUIRIES (STAGE 3E INBOX) */}
      {activeTab === 'inquiries' && (
        <InquiriesInbox />
      )}

      {/* Tab 7: STATIC PAGE CONTENT CMS */}
      {activeTab === 'static-content' && (
        <StaticContentEditor />
      )}

      {/* Tab 8: SUPABASE CLOUD SYNC & SCHEMA & DOWNLOAD */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Netlify Deployment Package Section */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200 space-y-5 font-burmese">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    GitHub & Netlify အတွက် Source Code နှင့် Build Package ရယူရန်
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Google AI Studio Preview ပတ်ဝန်းကျင်မှ ၁၀၀% စိတ်ချရသော ZIP ဖိုင်ကို ဒေါင်းလုဒ်ပြုလုပ်နိုင်ပါသည်
                  </p>
                </div>
              </div>
            </div>

            {/* Status alerts */}
            {downloadSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{downloadSuccessMsg}</span>
              </div>
            )}
            {downloadErrorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{downloadErrorMsg}</span>
              </div>
            )}

            {/* Notice explaining the 10.3 KB issue */}
            <div className="p-3.5 rounded-xl bg-white/90 border border-sky-200 text-xs text-slate-700 leading-relaxed space-y-1.5">
              <div className="font-bold text-sky-900 flex items-center gap-1.5">
                <span>💡 ဒေါင်းလုဒ်ဖိုင် 10.3 KB သာ ဖြစ်သွားရသည့် အကြောင်းရင်းနှင့် ဖြေရှင်းချက်-</span>
              </div>
              <p>
                AI Studio Preview တွင် သာမန်ဒေါင်းလုဒ်ခလုတ်ကို နှိပ်ပါက Google Authentication Cookie Proxy ကြောင့် 10 KB ရှိသော စစ်ဆေးသည့်စာမျက်နှာသာ ဒေါင်းမိတတ်ပါသည်။ 
                ထို့ကြောင့် အောက်ပါ <strong>"Client-Side Instant ZIP Generator"</strong> ခလုတ်ကို နှိပ်ပါက ကွန်ပျူတာ Browser မှတဆင့် အစစ်အမှန် Source Code ဖိုင်အားလုံးကို တိုက်ရိုက် ထုပ်ပိုးပေးမည်ဖြစ်၍ လုံးဝ Extract လုပ်၍ ရသွားပါမည်။
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Option 1: Browser JSZip Generator (Guaranteed Fix) */}
              <div className="p-5 rounded-2xl bg-white border-2 border-sky-400/80 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold mb-2">
                    ⭐ အကြံပြုထားသော နည်းလမ်း (၁၀၀% အလုပ်လုပ်သည်)
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    💻 Download Full Source Code (Browser JSZip)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    GitHub (`solution4u`) သို့ တင်ရန်အတွက် Clean Source Code (TypeScript, React, Components, Images) အပြည့်အစုံ
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClientSideZipDownload}
                  disabled={isExportingClientZip}
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isExportingClientZip ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{exportProgressText || 'ZIP ဖိုင် ပြင်ဆင်နေပါသည်...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Clean Source.zip (Generate Now)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Option 2: Netlify dist bundle in New Tab */}
              <div className="p-5 rounded-2xl bg-white border border-slate-300 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold mb-2">
                    📦 Netlify Deploy Manually
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    🚀 Download Production dist.zip (~3.6 MB)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Netlify ပေါ်သို့ Drag & Drop ဆွဲချ၍ Website ချက်ချင်းလွှင့်တင်လိုပါက ဤ Compiled Build ဖိုင်ကို သုံးနိုင်ပါသည်
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenDirectInNewTab('solution-for-you-dist.zip')}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Download dist.zip (Open in New Tab)</span>
                </button>
              </div>
            </div>

            {/* Direct Link Copy Section */}
            <div className="pt-2 border-t border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-600">
                တိုက်ရိုက်လင့်ခ် (Browser Address Bar တွင် paste ပြီး ဖွင့်နိုင်ပါသည်)-
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  readOnly
                  value={directSourceUrl}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-mono text-slate-600 w-full sm:w-80 truncate"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(directSourceUrl);
                    setCopiedDirectLink(true);
                    setTimeout(() => setCopiedDirectLink(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold shrink-0 hover:bg-slate-700 transition-colors inline-flex items-center gap-1"
                >
                  {copiedDirectLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDirectLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">

            <div>
              <h2 className="text-base font-bold text-slate-900">Supabase Cloud Database Status</h2>
              <p className="text-xs text-slate-500 font-burmese">
                Supabase PostgreSQL ဇယားများ၊ RLS လုံခြုံရေးနှင့် သတင်းအချက်အလက် ချိတ်ဆက်မှု
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isSupabaseConfigured
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isSupabaseConfigured ? 'Supabase Connected' : 'Resilient Local-First Fallback Mode'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-800">
              ⚡ အသင့်သုံးနိုင်သော စနစ် (Ready Out-of-the-Box) -
            </p>
            <p>
              လက်ရှိတွင် သတင်းဆောင်းပါးများ၊ ဝန်ဆောင်မှု (၁၂) မျိုးနှင့် ဆက်သွယ်ရန် အချက်အလက်များအားလုံးသည် 
              Resilient LocalStorage ဖြင့် ချက်ချင်း အလုပ်လုပ်နေပါသည်။ Supabase Cloud Database သို့ တိုက်ရိုက် ချိတ်ဆက်လိုပါက 
              အောက်ပါ SQL Script ကို ကူးယူပြီး Supabase Project &gt; SQL Editor တွင် Run ပေးရုံသာ ဖြစ်ပါသည်။
            </p>
          </div>

          {/* Supabase One-Click Data Migration Tool */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-3 font-burmese">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>LocalStorage မှ Posts များကို Supabase သို့ Synchronize / Migrate ပြုလုပ်ရန်</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Browser ထဲရှိ လက်ရှိဆောင်းပါးများကို Supabase Cloud Table သို့ လုံခြုံစွာ ကူးယူထည့်သွင်းပေးပါမည် (Duplicate မဖြစ်အောင် စစ်ဆေးပေးပါသည်)။
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunMigration}
                disabled={isMigrating || !isSupabaseConfigured}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                {isMigrating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Migrating...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Migrate Posts to Supabase</span>
                  </>
                )}
              </button>
            </div>

            {migrationStatus && (
              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{migrationStatus}</span>
              </div>
            )}
            {!isSupabaseConfigured && (
              <p className="text-[11px] text-amber-700">
                ℹ️ Supabase Environment Variables (URL & Anon Key) ထည့်သွင်းပြီးမှသာ Cloud Sync ခလုတ်ကို နှိပ်နိုင်ပါမည်။
              </p>
            )}
          </div>

          {/* GitHub & Netlify Environment Variables Guide */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 font-burmese">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Netlify တွင် ထည့်သွင်းရမည့် Environment Variables (Site Configuration)</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              GitHub Repo မှတဆင့် Netlify ပေါ်သို့ Deploy လုပ်ပါက Supabase ချိတ်ဆက်နိုင်ရန် Netlify Dashboard (&gt; Site configuration &gt; Environment variables) တွင် အောက်ပါ Variable (၂) ခုကို ထည့်သွင်းနိုင်ပါသည်-
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 bg-white rounded-xl border border-amber-200">
                <span className="font-bold text-slate-800">1. VITE_SUPABASE_URL</span>
                <p className="text-slate-500 font-sans text-[11px] mt-0.5">
                  သင်၏ Supabase Project URL (ဥပမာ- <code>https://xyzcompany.supabase.co</code>)
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-200">
                <span className="font-bold text-slate-800">2. VITE_SUPABASE_ANON_KEY</span>
                <p className="text-slate-500 font-sans text-[11px] mt-0.5">
                  သင်၏ Supabase Project API Keys ထဲမှ <code>anon</code> / <code>public</code> key သာ ဖြစ်ပါသည်။
                </p>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] leading-relaxed">
              ⚠️ <strong>အရေးကြီးသတိပေးချက်:</strong> <code>service_role</code> (secret key) ကို Netlify Frontend သို့မဟုတ် GitHub Repo တွင် လုံးဝ (လုံးဝ) မထည့်ရပါ။ Public <code>anon</code> key တစ်ခုတည်းသာ လိုအပ်ပါသည်။
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase font-mono">
                Supabase SQL DDL Schema (Posts, Services, RLS)
              </span>
              <button
                onClick={handleCopySchema}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? 'Copied!' : 'Copy SQL Schema'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-sky-300 rounded-xl text-xs font-mono overflow-x-auto max-h-96">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

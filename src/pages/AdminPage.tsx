import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Post, Service, SiteSettings } from '../types';
import { SUPABASE_SQL_SCHEMA, isSupabaseConfigured } from '../lib/supabase';
import { generateClientSideSourceZip } from '../lib/projectExporter';
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
  AlertCircle
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const {
    isAdminLoggedIn,
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
    navigateTo
  } = useApp();

  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'new-post' | 'copy-editor' | 'branding' | 'services' | 'settings' | 'database'>('posts');

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

  // Site Settings & Copy Editor form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Schema copy status
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Client-side ZIP Export States
  const [isExportingClientZip, setIsExportingClientZip] = useState(false);
  const [exportProgressText, setExportProgressText] = useState('');
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);
  const [downloadErrorMsg, setDownloadErrorMsg] = useState<string | null>(null);
  const [copiedDirectLink, setCopiedDirectLink] = useState(false);

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


  // Handle Admin Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginAdmin(passwordInput);
    if (!ok) {
      setLoginError(true);
    } else {
      setLoginError(false);
      setPasswordInput('');
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

  // Helper for image upload -> data URL conversion
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: 'postCover' | 'logo' | 'fbCover' | 'fbProfile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (targetField === 'postCover') {
        setFormCoverImage(dataUrl);
      } else if (targetField === 'logo') {
        setSettingsForm((prev) => ({ ...prev, logoUrl: dataUrl }));
      } else if (targetField === 'fbCover') {
        setSettingsForm((prev) => ({ ...prev, facebookCoverUrl: dataUrl }));
      } else if (targetField === 'fbProfile') {
        setSettingsForm((prev) => ({ ...prev, facebookProfileUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
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

    const generatedSlug =
      formSlug.trim() ||
      formTitle
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 40) ||
      'post-' + Date.now();

    const postToSave: Post = {
      id: editingPost ? editingPost.id : 'post_' + Date.now(),
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

    await savePost(postToSave);
    handleResetForm();
    setActiveTab('posts');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
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
          <div className="w-16 h-16 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">Admin Portal Login</h1>
            <p className="text-xs text-slate-500 mt-1 font-burmese">
              စာသားများ၊ ဆောင်းပါးများ၊ Logo နှင့် Facebook ပုံများ စီမံရန်
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin စကားဝှက် (Password)
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="စကားဝှက် ရိုက်ထည့်ပါ..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-sm"
              />
              {loginError && (
                <p className="text-xs text-rose-500 mt-1 font-burmese">
                  စကားဝှက် မှားယွင်းနေပါသည်။ (Default: solution4u)
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl transition-colors shadow-xs"
            >
              အကောင့်ဝင်မည်
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-400">
            <p>Demo Password: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">solution4u</code></p>
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
          <button
            onClick={() => navigateTo('home')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-burmese"
          >
            ဝက်ဘ်ဆိုက် ကြည့်ရှုမည်
          </button>

          <button
            onClick={logoutAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ထွက်မည်</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 text-xs font-semibold text-slate-600 scrollbar-none font-burmese">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'posts' ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Contents စာရင်း ({posts.length})</span>
        </button>

        <button
          onClick={() => {
            handleResetForm();
            setActiveTab('new-post');
          }}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'new-post' ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{editingPost ? 'Content ပြင်ရန်' : 'Content အသစ်တင်မည်'}</span>
        </button>

        <button
          onClick={() => setActiveTab('copy-editor')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'copy-editor' ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>စာသားများ ပြင်ဆင်ရန် (Text Editor)</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'branding' ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Logo & Facebook Profile/Cover</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'services' ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>ဝန်ဆောင်မှုများ ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>ဖုန်း / LINE / လိပ်စာ</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'database' ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Supabase SQL</span>
        </button>
      </div>

      {/* Tab 1: POSTS LIST */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
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
                            if (window.confirm('ဆောင်းပါးကို အမှန်တကယ် ဖျက်လိုပါသလား?')) {
                              deletePost(post.id);
                            }
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700"
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
                <span className="text-[11px] text-slate-500">Device ပေါ်မှ ပုံရွေးချယ်နိုင်ပါသည်</span>
              </div>

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
                    <span>ဖုန်း/ကွန်ပျူတာမှ ဓာတ်ပုံရွေးချယ်မည်</span>
                    <input
                      type="file"
                      accept="image/*"
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

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                မသိမ်းဘဲ ပြန်ထွက်မည်
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                {editingPost ? 'ပြင်ဆင်ချက် သိမ်းဆည်းမည်' : 'ဆောင်းပါး အသစ် တင်မည်'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: TEXT & COPY EDITOR (Burmese copy editor) */}
      {activeTab === 'copy-editor' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-burmese">
                ဝက်ဘ်ဆိုက်ပေါ်ရှိ မြန်မာစာသားများ ပြင်ဆင်ရန် (Text & Copy Editor)
              </h2>
              <p className="text-xs text-slate-500 font-burmese">
                မူလစာမျက်နှာ ခေါင်းစဉ်များ၊ ဖော်ပြချက်များနှင့် ဆောင်ပုဒ်များကို စိတ်ကြိုက် ပြင်ဆင်နိုင်ပါသည်
              </p>
            </div>
            {settingsSaved && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" /> သိမ်းဆည်းပြီးပါပြီ!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5 font-burmese text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Hero Main Headline (မူလစာမျက်နှာ အဓိက ခေါင်းစဉ်ကြီး)
              </label>
              <textarea
                rows={2}
                value={settingsForm.heroHeadline}
                onChange={(e) => setSettingsForm({ ...settingsForm, heroHeadline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Hero Supporting Text (ခေါင်းစဉ်ငယ် ရှင်းလင်းချက်)
              </label>
              <textarea
                rows={3}
                value={settingsForm.heroSupportingText}
                onChange={(e) => setSettingsForm({ ...settingsForm, heroSupportingText: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Trust Statement (ယုံကြည်စိတ်ချရမှု ဆောင်ပုဒ်)
                </label>
                <input
                  type="text"
                  value={settingsForm.heroTrustStatement}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroTrustStatement: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Emotional Reassurance Quote (နွေးထွေးသော မိတ်ဆွေ ကတိစကား)
                </label>
                <input
                  type="text"
                  value={settingsForm.emotionalQuote}
                  onChange={(e) => setSettingsForm({ ...settingsForm, emotionalQuote: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                တာဝန်ယူမှုဆိုင်ရာ ရှင်းလင်းချက် (Disclaimer Text)
              </label>
              <textarea
                rows={3}
                value={settingsForm.disclaimer}
                onChange={(e) => setSettingsForm({ ...settingsForm, disclaimer: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                စာသား ပြင်ဆင်ချက်များ သိမ်းဆည်းမည်
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: BRANDING (LOGO, FB PROFILE & COVER) */}
      {activeTab === 'branding' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-burmese">
                Logo နှင့် Facebook Profile / Cover ဓာတ်ပုံများ
              </h2>
              <p className="text-xs text-slate-500 font-burmese">
                လုပ်ငန်း၏ Logo၊ Facebook Page Profile နှင့် Cover Photo များကို တိုက်ရိုက် Upload လုပ်နိုင်ပါသည်
              </p>
            </div>
            {settingsSaved && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" /> သိမ်းဆည်းပြီးပါပြီ!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6 font-burmese text-sm">
            {/* 1. Official Logo */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  ၁။ Agency Official Logo (အမှတ်တံဆိပ်)
                </label>
                <span className="text-[11px] text-slate-500">Header နှင့် Footer တွင် ပြသမည့် Logo</span>
              </div>

              <div className="flex items-center gap-4">
                {settingsForm.logoUrl ? (
                  <img
                    src={settingsForm.logoUrl}
                    alt="Logo preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-xs text-slate-500 font-mono">
                    No Logo
                  </div>
                )}

                <div className="space-y-1.5 flex-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-sky-600" />
                    <span>Logo ဓာတ်ပုံ ရွေးချယ်မည် (Upload)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={settingsForm.logoUrl || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                    placeholder="or enter image URL..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. Facebook Profile Picture */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  ၂။ Facebook Page Profile Picture (ပရိုဖိုင်ဓာတ်ပုံ)
                </label>
                <span className="text-[11px] text-slate-500">Facebook အဖွဲ့အစည်း ပရိုဖိုင်</span>
              </div>

              <div className="flex items-center gap-4">
                {settingsForm.facebookProfileUrl ? (
                  <img
                    src={settingsForm.facebookProfileUrl}
                    alt="FB profile preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-400 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                    FB
                  </div>
                )}

                <div className="space-y-1.5 flex-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Facebook Profile ဓာတ်ပုံ ရွေးချယ်မည်</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'fbProfile')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={settingsForm.facebookProfileUrl || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebookProfileUrl: e.target.value })}
                    placeholder="or enter profile image URL..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. Facebook Page URL */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ၃။ Official Facebook Page URL (Facebook Link)
              </label>
              <input
                type="text"
                value={settingsForm.facebookPageUrl || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, facebookPageUrl: e.target.value })}
                placeholder="https://facebook.com/solution4u.official"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Branding အချက်အလက်များ သိမ်းဆည်းမည်
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 5: SERVICES MANAGEMENT */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 font-burmese">
            ဝန်ဆောင်မှုများ (၁၂ ခု စီမံခန့်ခွဲခြင်း)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-700">#{svc.order}</span>
                    <h3 className="text-sm font-bold text-slate-900 font-burmese">{svc.title}</h3>
                  </div>

                  <button
                    onClick={() => updateService({ ...svc, isActive: !svc.isActive })}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      svc.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {svc.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <p className="text-xs text-slate-500 font-burmese line-clamp-2">
                  {svc.shortDescription}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span className="text-slate-400 font-mono">{svc.category}</span>
                  <button
                    onClick={() => navigateTo('service-detail', svc.slug)}
                    className="text-sky-600 hover:underline font-burmese"
                  >
                    Live ကြည့်ရန် →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: CONTACT & SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-burmese">
                အေဂျင်စီ ဆက်သွယ်ရန် ဖုန်းနှင့် လိပ်စာ
              </h2>
              <p className="text-xs text-slate-500 font-burmese">
                ဖုန်းနံပါတ်၊ WhatsApp၊ LINE ID နှင့် လိပ်စာများကို ဤနေရာတွင် ပြင်ဆင်နိုင်ပါသည်
              </p>
            </div>
            {settingsSaved && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" /> သိမ်းဆည်းပြီးပါပြီ!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 font-burmese text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  လုပ်ငန်းအမည် (Agency Name)
                </label>
                <input
                  type="text"
                  value={settingsForm.agencyName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, agencyName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ဖုန်းနံပါတ် (Phone)
                </label>
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  LINE ID
                </label>
                <input
                  type="text"
                  value={settingsForm.lineId}
                  onChange={(e) => setSettingsForm({ ...settingsForm, lineId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Link
                </label>
                <input
                  type="text"
                  value={settingsForm.whatsappUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Messenger Link
                </label>
                <input
                  type="text"
                  value={settingsForm.messengerUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, messengerUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ရုံးတည်နေရာ လိပ်စာ (Office Address)
              </label>
              <textarea
                rows={2}
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ရုံးဖွင့်ချိန် (တနင်္လာ မှ သောကြာ)
              </label>
              <input
                type="text"
                value={settingsForm.businessHoursWeekday}
                onChange={(e) => setSettingsForm({ ...settingsForm, businessHoursWeekday: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ရုံးပိတ်ချိန် (စနေ၊ တနင်္ဂနွေ အသိပေးချက်)
              </label>
              <input
                type="text"
                value={settingsForm.businessHoursWeekend}
                onChange={(e) => setSettingsForm({ ...settingsForm, businessHoursWeekend: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Settings သိမ်းဆည်းမည်
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 7: SUPABASE CLOUD SYNC & SCHEMA & DOWNLOAD */}
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

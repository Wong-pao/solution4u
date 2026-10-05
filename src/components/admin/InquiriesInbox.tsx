import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ConsultationInquiry, InquiryStatus } from '../../types';
import { inquiriesApi } from '../../lib/cms';
import {
  Inbox,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  RefreshCw,
  Loader2,
  User,
  Phone,
  PhoneCall,
  Calendar,
  Clock,
  MessageSquare,
  Tag,
  Check,
  X,
  ExternalLink,
  Copy,
  ChevronDown,
  Filter,
  Send,
  MessageCircle,
} from 'lucide-react';

export const InquiriesInbox: React.FC = () => {
  // Main data state
  const [inquiries, setInquiries] = useState<ConsultationInquiry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  // Active detail modal
  const [selectedInquiry, setSelectedInquiry] = useState<ConsultationInquiry | null>(null);

  // Delete in-app confirmation modal (NO window.confirm)
  const [deleteTarget, setDeleteTarget] = useState<ConsultationInquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Action status indicators
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Fetch inquiries from Supabase
  const loadInquiries = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await inquiriesApi.getInquiries();
      // Ensure sorted by created_at DESC (newest first)
      const sorted = [...data].sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
      setInquiries(sorted);
    } catch (err: any) {
      console.error('[InquiriesInbox] Load error:', err);
      setErrorMessage(
        err.message || 'မေးမြန်းချက်များကို ရယူရာတွင် အမှားဖြစ်ပေါ်နေပါသည်။ ခေတ္တစောင့်ပြီး ပြန်လည်ကြိုးစားပေးပါ။'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  // Status counts for filter chips
  const counts = useMemo(() => {
    const total = inquiries.length;
    const newCount = inquiries.filter((i) => i.status === 'new').length;
    const contactedCount = inquiries.filter((i) => i.status === 'contacted').length;
    const resolvedCount = inquiries.filter((i) => i.status === 'resolved').length;
    return { total, newCount, contactedCount, resolvedCount };
  }, [inquiries]);

  // Filtered & searched inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // Channel filter
      if (channelFilter !== 'all' && item.contactChannel !== channelFilter) {
        return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.fullName.toLowerCase().includes(q);
        const matchesPhone = item.phoneNumber.toLowerCase().includes(q);
        const matchesService = item.serviceType.toLowerCase().includes(q);
        const matchesMessage = (item.message || '').toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesService || matchesMessage;
      }

      return true;
    });
  }, [inquiries, statusFilter, channelFilter, searchQuery]);

  // Update status handler
  const handleStatusChange = async (inquiry: ConsultationInquiry, newStatus: InquiryStatus) => {
    if (inquiry.status === newStatus || updatingId) return;
    setUpdatingId(inquiry.id);
    setFeedbackError(null);

    try {
      const res = await inquiriesApi.updateInquiryStatus(inquiry.id, newStatus);
      if (!res.success) {
        throw new Error(res.error || 'အခြေအနေ ပြောင်းလဲရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
      }

      // Update local state directly
      setInquiries((prev) =>
        prev.map((item) => (item.id === inquiry.id ? { ...item, status: newStatus } : item))
      );

      // If active in detail modal, update it there too
      if (selectedInquiry && selectedInquiry.id === inquiry.id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }

      const statusLabels: Record<InquiryStatus, string> = {
        new: 'အသစ် (New)',
        contacted: 'ဆက်သွယ်ပြီး (Contacted)',
        resolved: 'ပြီးပြတ်/ဖြေရှင်းပြီး (Resolved)',
      };

      setFeedbackSuccess(
        `"${inquiry.fullName}" ၏ မေးမြန်းချက် အခြေအနေကို "${statusLabels[newStatus]}" သို့ ပြောင်းလဲပြီးပါပြီ`
      );
      setTimeout(() => setFeedbackSuccess(null), 3500);
    } catch (err: any) {
      console.error('[InquiriesInbox] Update error:', err);
      setFeedbackError(err.message || 'အခြေအနေ ပြောင်းလဲရန် မအောင်မြင်ပါ');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    setFeedbackError(null);

    try {
      const res = await inquiriesApi.deleteInquiry(deleteTarget.id);
      if (!res.success) {
        throw new Error(res.error || 'ဖျက်ရန် မအောင်မြင်ပါ');
      }

      // Remove from local list
      setInquiries((prev) => prev.filter((item) => item.id !== deleteTarget.id));

      // Close modal if deleted item was selected
      if (selectedInquiry && selectedInquiry.id === deleteTarget.id) {
        setSelectedInquiry(null);
      }

      setFeedbackSuccess(`"${deleteTarget.fullName}" ၏ မေးမြန်းချက်မှတ်တမ်းကို အောင်မြင်စွာ ဖျက်ပြီးပါပြီ`);
      setDeleteTarget(null);
      setTimeout(() => setFeedbackSuccess(null), 3500);
    } catch (err: any) {
      console.error('[InquiriesInbox] Delete error:', err);
      setFeedbackError(err.message || 'ဖျက်ရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy phone number to clipboard helper
  const handleCopyPhone = (id: string, phoneStr: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(phoneStr);
      setCopiedPhoneId(id);
      setTimeout(() => setCopiedPhoneId(null), 2000);
    }
  };

  // Format date helper
  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  // Helper for contact channel badges — Priority: 1. Messenger, 2. Phone, 3. LINE, 4. Telegram, 5. Email
  const renderChannelBadge = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'messenger':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Messenger
          </span>
        );
      case 'phone':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Phone className="w-3 h-3 text-purple-500" />
            ဖုန်းတိုက်ရိုက်
          </span>
        );
      case 'line':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            LINE
          </span>
        );
      case 'telegram':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Telegram
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            Email
          </span>
        );
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            WhatsApp
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Messenger
          </span>
        );
    }
  };

  // Helper for status badges
  const renderStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 font-burmese shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            အသစ် (New)
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 font-burmese">
            <PhoneCall className="w-3 h-3 text-sky-500" />
            ဆက်သွယ်ပြီး
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-burmese">
            <Check className="w-3 h-3 text-slate-500" />
            ပြီးပြတ်/ဖြေရှင်းပြီး
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left font-burmese">
      {/* Top Banner & Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-burmese">
                  Inquiries Management Inbox (မေးမြန်းချက်များ စီမံခန့်ခွဲခြင်း)
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                  {counts.total} Inquiries
                </span>
                {counts.newCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white font-mono animate-pulse">
                    {counts.newCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-burmese">
                ဝက်ဘ်ဆိုက် အခမဲ့ဆွေးနွေးတိုင်ပင်ရန် Form မှ ပေးပို့ထားသော ဖောက်သည်များ၏ မေးမြန်းချက်များကို စစ်ဆေးဖတ်ရှုခြင်း၊ အခြေအနေ ပြောင်းလဲခြင်းနှင့် မှတ်တမ်းထိန်းသိမ်းခြင်း
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={loadInquiries}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="အချက်အလက် ပြန်လည်ရယူမည်"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Global Alerts / Feedback */}
      {feedbackSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-burmese shadow-2xs">
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
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between font-burmese shadow-2xs">
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

      {/* Error state with retry */}
      {errorMessage && !isLoading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3 font-burmese">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-rose-900">အချက်အလက် ရယူရာတွင် အမှားဖြစ်ပေါ်ပါသည်</h3>
            <p className="text-xs text-rose-700 max-w-md mx-auto">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={loadInquiries}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ထပ်မံကြိုးစားမည် (Retry)</span>
          </button>
        </div>
      )}

      {/* Search & Filters Bar */}
      {!errorMessage && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ရှာဖွေရန် (အမည်၊ ဖုန်း၊ ဝန်ဆောင်မှု၊ စာသား)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills / Selects */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
            {/* Status Filter Pills */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                အားလုံး ({counts.total})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('new')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'new'
                    ? 'bg-amber-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>အသစ်</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === 'new' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {counts.newCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('contacted')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'contacted'
                    ? 'bg-sky-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>ဆက်သွယ်ပြီး</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === 'contacted' ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {counts.contactedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('resolved')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'resolved'
                    ? 'bg-slate-700 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>ပြီးပြတ်</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === 'resolved' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {counts.resolvedCount}
                </span>
              </button>
            </div>

            {/* Channel Filter Select — Priority: 1. Messenger, 2. Phone, 3. LINE, 4. Telegram, 5. Email */}
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 outline-hidden focus:border-sky-500 font-semibold"
            >
              <option value="all">ဆက်သွယ်ရန် လမ်းကြောင်း အားလုံး</option>
              <option value="messenger">Messenger</option>
              <option value="phone">ဖုန်းတိုက်ရိုက်</option>
              <option value="line">LINE</option>
              <option value="telegram">Telegram</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp (Legacy)</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3 font-burmese shadow-2xs">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-600 font-semibold">
            Supabase `public.inquiries` မှ မေးမြန်းချက်များကို ရယူနေပါသည်...
          </p>
        </div>
      )}

      {/* Empty State when zero inquiries exist in database */}
      {!isLoading && !errorMessage && inquiries.length === 0 && (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center font-burmese space-y-4 max-w-lg mx-auto shadow-xs my-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-2xs">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              မေးမြန်းထားသော အချက်အလက်များ မရှိသေးပါ (No Inquiries Yet)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              ဝက်ဘ်ဆိုက် အသုံးပြုသူများမှ အခမဲ့ ဆွေးနွေးတိုင်ပင်ရန် Form မှတစ်ဆင့် မေးမြန်းချက်များ ပေးပို့လာပါက ဤနေရာတွင် အချိန်နှင့်တပြေးညီ အသေးစိတ် ဖော်ပြပေးမည် ဖြစ်ပါသည်။
            </p>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Supabase `public.inquiries` ချိတ်ဆက်မှု အဆင်သင့်ဖြစ်ပါသည်
            </span>
          </div>
        </div>
      )}

      {/* Filtered Empty State (when database has inquiries, but current filter matches 0) */}
      {!isLoading && !errorMessage && inquiries.length > 0 && filteredInquiries.length === 0 && (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center font-burmese space-y-3 shadow-2xs">
          <p className="text-slate-500 text-xs">
            ရွေးချယ်ထားသော Filter သို့မဟုတ် ရှာဖွေမှု စာသားနှင့် ကိုက်ညီသော မေးမြန်းချက် မရှိပါ
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setChannelFilter('all');
            }}
            className="text-xs text-sky-600 hover:underline font-bold"
          >
            Filter အားလုံး ပြန်လည်ရှင်းလင်းမည်
          </button>
        </div>
      )}

      {/* Inquiries List View */}
      {!isLoading && !errorMessage && filteredInquiries.length > 0 && (
        <div className="space-y-3">
          {filteredInquiries.map((inquiry) => {
            const isUpdating = updatingId === inquiry.id;

            return (
              <div
                key={inquiry.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-150 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  inquiry.status === 'new'
                    ? 'border-amber-200 bg-amber-50/20 shadow-2xs hover:border-amber-300'
                    : inquiry.status === 'contacted'
                    ? 'border-sky-200/80 bg-white shadow-2xs hover:border-sky-300'
                    : 'border-slate-200 bg-slate-50/60 opacity-85 hover:border-slate-300'
                }`}
              >
                {/* Left Section: User, Contact, Service, Message */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Avatar Icon */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                      inquiry.status === 'new'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : inquiry.status === 'contacted'
                        ? 'bg-sky-100 text-sky-800 border-sky-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </div>

                  {/* Customer Info & Message snippet */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    {/* Top Row: Customer Name, Status Badge, Channel Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {inquiry.fullName}
                      </h4>

                      {renderStatusBadge(inquiry.status)}
                      {renderChannelBadge(inquiry.contactChannel)}

                      {/* Service Type Tag */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        {inquiry.serviceType}
                      </span>
                    </div>

                    {/* Phone & Date Row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {/* Phone with copy & click to call */}
                      <div className="flex items-center gap-1.5 font-mono text-slate-700 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a
                          href={`tel:${inquiry.phoneNumber}`}
                          className="hover:text-sky-700 hover:underline"
                        >
                          {inquiry.phoneNumber}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(inquiry.id, inquiry.phoneNumber)}
                          title="ဖုန်းနံပါတ် ကူးယူမည်"
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          {copiedPhoneId === inquiry.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      <span className="text-slate-300">•</span>

                      {/* Date */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(inquiry.createdAt)}</span>
                      </div>
                    </div>

                    {/* Message Preview */}
                    <div className="pt-0.5">
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 bg-white/70 p-2 rounded-xl border border-slate-100">
                        {inquiry.message || '(မက်ဆေ့ခ်ျ ရေးသားထားခြင်း မရှိပါ)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Section: Status Dropdown & Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {/* Status Changer Select */}
                  <div className="relative">
                    <select
                      value={inquiry.status}
                      disabled={isUpdating}
                      onChange={(e) =>
                        handleStatusChange(inquiry, e.target.value as InquiryStatus)
                      }
                      className="text-xs font-semibold px-3 py-2 pr-7 rounded-xl border border-slate-200 bg-white text-slate-700 outline-hidden hover:border-slate-300 focus:border-sky-500 transition-colors cursor-pointer disabled:opacity-50 appearance-none"
                    >
                      <option value="new">အသစ် (New)</option>
                      <option value="contacted">ဆက်သွယ်ပြီး (Contacted)</option>
                      <option value="resolved">ပြီးပြတ် (Resolved)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* View Details Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedInquiry(inquiry)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded-xl transition-colors cursor-pointer"
                    title="အသေးစိတ် အချက်အလက် ကြည့်ရှုမည်"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>အသေးစိတ်</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(inquiry)}
                    className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-colors cursor-pointer"
                    title="ဖျက်မည်"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* INQUIRY DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs font-burmese text-left">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    မေးမြန်းချက် အသေးစိတ် (Inquiry Details)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID: {selectedInquiry.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Customer info & message */}
            <div className="space-y-4 text-xs">
              {/* Customer Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    မေးမြန်းသူ အမည်
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {selectedInquiry.fullName}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    ဖုန်းနံပါတ်
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                    <span>{selectedInquiry.phoneNumber}</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyPhone(selectedInquiry.id, selectedInquiry.phoneNumber)
                      }
                      title="ကူးယူမည်"
                      className="p-0.5 text-slate-400 hover:text-slate-600"
                    >
                      {copiedPhoneId === selectedInquiry.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    ဆက်သွယ်ရန် လမ်းကြောင်း
                  </span>
                  <div className="mt-0.5">
                    {renderChannelBadge(selectedInquiry.contactChannel)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    ရက်စွဲနှင့် အချိန်
                  </span>
                  <span className="text-xs font-mono text-slate-700">
                    {formatDate(selectedInquiry.createdAt)}
                  </span>
                </div>
              </div>

              {/* Service Type */}
              <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-sky-800 block uppercase">
                    စိတ်ဝင်စားသည့် ဝန်ဆောင်မှု
                  </span>
                  <span className="text-xs font-bold text-sky-950">
                    {selectedInquiry.serviceType}
                  </span>
                </div>
              </div>

              {/* Full Message Box */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 block">
                  မေးမြန်းလိုသော အကြောင်းအရာ (Customer Message):
                </span>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedInquiry.message || '(မက်ဆေ့ခ်ျ ရေးသားထားခြင်း မရှိပါ)'}
                </div>
              </div>

              {/* Status Update Control inside modal */}
              <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    လက်ရှိ အခြေအနေ (Status):
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    ဆက်သွယ်စုံစမ်းပြီးပါက Status အား ပြောင်းလဲသတ်မှတ်ပါ
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedInquiry, 'new')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      selectedInquiry.status === 'new'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    အသစ်
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedInquiry, 'contacted')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      selectedInquiry.status === 'contacted'
                        ? 'bg-sky-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ဆက်သွယ်ပြီး
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedInquiry, 'resolved')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      selectedInquiry.status === 'resolved'
                        ? 'bg-slate-700 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ပြီးပြတ်
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(selectedInquiry);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ဖျက်မည်</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                ပိတ်မည် (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IN-APP CONFIRMATION MODAL FOR DELETION (NO window.confirm) */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs font-burmese text-left">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                မေးမြန်းချက် ဖျက်ရန် သေချာပါသလား?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                သင်သည် <span className="font-bold text-slate-900">"{deleteTarget.fullName}"</span> (ဖုန်း: {deleteTarget.phoneNumber}) ၏ မေးမြန်းချက် မှတ်တမ်းအား Supabase database မှ အပြီးပိုင် ဖျက်တော့မည် ဖြစ်ပါသည်။
              </p>
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                သတိပြုရန်- ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြင်ဆင်၍ မရနိုင်ပါ။ ဖျက်ပြီးပါက ပြန်လည်ရယူနိုင်မည် မဟုတ်ပါ။
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

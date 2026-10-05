import React, { useState, useRef } from 'react';
import { uploadWebsiteMedia, deleteWebsiteMedia } from '../../lib/supabase';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  ExternalLink,
  Eye,
} from 'lucide-react';

export interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: 'general' | 'about' | 'services' | string;
  recommendedSize?: string;
  helpText?: string;
  disabled?: boolean;
  required?: boolean;
  allowManualUrl?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value = '',
  onChange,
  folder = 'general',
  recommendedSize,
  helpText,
  disabled = false,
  allowManualUrl = true,
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [imgLoadError, setImgLoadError] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File selection & upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset feedback
    setUploadError(null);
    setUploadSuccess(null);
    setImgLoadError(false);

    // 1. Client-side validation: Type (require BOTH valid MIME type and valid extension)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const validExts = ['jpg', 'jpeg', 'png', 'webp'];

    if (!validTypes.includes(file.type) || !validExts.includes(ext)) {
      setUploadError('JPG, PNG သို့မဟုတ် WEBP ဓာတ်ပုံဖိုင်များသာ တင်ခွင့်ပြုပါသည် (Allowed: JPG, PNG, WEBP)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Client-side validation: Size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError('ဓာတ်ပုံအရွယ်အစားသည် 5 MB ထက်မကျော်လွန်ရပါ (Max size: 5MB)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);

    try {
      // 3. Upload new image first
      const newPublicUrl = await uploadWebsiteMedia(file, folder);

      // Keep previous URL for safe cleanup
      const previousUrl = value;

      // 4. Update field value to new URL
      onChange(newPublicUrl);
      setUploadSuccess('Supabase Storage ("website-media") သို့ ဓာတ်ပုံအောင်မြင်စွာ တင်ပြီးပါပြီ');
      setTimeout(() => setUploadSuccess(null), 4000);

      // 5. If previous image was in 'website-media' and different, safely clean up old file
      if (previousUrl && previousUrl !== newPublicUrl && previousUrl.includes('/website-media/')) {
        try {
          await deleteWebsiteMedia(previousUrl);
        } catch (cleanupErr) {
          console.warn('[ImageUploadField] Old image cleanup notice:', cleanupErr);
        }
      }
    } catch (err: any) {
      console.error('[ImageUploadField] Upload error:', err);
      setUploadError(err.message || 'ဓာတ်ပုံတင်ရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove image handler
  const handleRemoveImage = async () => {
    if (!value || disabled || isUploading) return;

    const previousUrl = value;
    onChange('');
    setUploadError(null);
    setUploadSuccess(null);
    setImgLoadError(false);

    // If removed image was in 'website-media', safely delete from storage
    if (previousUrl.includes('/website-media/')) {
      try {
        await deleteWebsiteMedia(previousUrl);
      } catch (err) {
        console.warn('[ImageUploadField] Delete storage file notice:', err);
      }
    }
  };

  const isStorageUrl = value.includes('/website-media/');
  const isBlogStorageUrl = value.includes('/blog-images/');
  const isLocalAsset = value.startsWith('/src/assets/') || value.startsWith('/images/');

  return (
    <div className="space-y-2 text-left font-burmese">
      {/* Label and Recommended Size */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <label className="block text-xs font-bold text-slate-800">
          {label}
        </label>
        {recommendedSize && (
          <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            အကြံပြုအရွယ်အစား: {recommendedSize}
          </span>
        )}
      </div>

      {/* Main Uploader Box */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
        {/* Alerts / Error feedback */}
        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-rose-700 hover:text-rose-900 font-bold px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {uploadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadSuccess(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Image Preview & Actions Area */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Thumbnail preview */}
          {value ? (
            <div className="relative group shrink-0">
              {!imgLoadError ? (
                <img
                  src={value}
                  alt={label}
                  onError={() => setImgLoadError(true)}
                  className="w-32 h-20 sm:w-36 sm:h-24 object-cover rounded-xl border border-slate-200 bg-white shadow-2xs"
                />
              ) : (
                <div className="w-32 h-20 sm:w-36 sm:h-24 rounded-xl border border-amber-200 bg-amber-50 flex flex-col items-center justify-center p-2 text-center text-amber-700">
                  <AlertCircle className="w-4 h-4 mb-1" />
                  <span className="text-[10px] leading-tight font-sans">ပုံဖတ်မရပါ (Broken Link)</span>
                </div>
              )}

              {/* Source badge indicator */}
              <div className="absolute bottom-1 left-1 bg-slate-900/80 backdrop-blur-2xs text-white text-[9px] px-1.5 py-0.5 rounded-md font-mono">
                {isStorageUrl
                  ? 'Cloud Storage'
                  : isBlogStorageUrl
                  ? 'Blog Storage'
                  : isLocalAsset
                  ? 'Local Asset'
                  : 'External URL'}
              </div>
            </div>
          ) : (
            <div className="w-32 h-20 sm:w-36 sm:h-24 rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 p-2 text-center shrink-0">
              <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
              <span className="text-[10px]">ဓာတ်ပုံ မရှိသေးပါ</span>
            </div>
          )}

          {/* Action buttons & info */}
          <div className="flex-1 space-y-2 w-full min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {/* File picker button */}
              <label
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  disabled || isUploading
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-50 text-sky-700 border border-slate-300 hover:border-sky-300'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                    <span>ဓာတ်ပုံတင်နေပါသည်...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-sky-600" />
                    <span>{value ? 'ဓာတ်ပုံ အသစ်လဲမည် (Upload)' : 'ဖုန်း/ကွန်ပျူတာမှ ဓာတ်ပုံရွေးချယ်မည်'}</span>
                  </>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={disabled || isUploading}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Remove button */}
              {value && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={disabled || isUploading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                  title="ဓာတ်ပုံကို ဖယ်ရှားမည်"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ဖျက်မည်</span>
                </button>
              )}

              {/* Toggle manual URL input */}
              {allowManualUrl && (
                <button
                  type="button"
                  onClick={() => setShowManualInput((prev) => !prev)}
                  className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Image URL တိုက်ရိုက် ထည့်သွင်းရန်"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{showManualInput ? 'URL ပိတ်မည်' : 'URL ထည့်ရန်'}</span>
                </button>
              )}
            </div>

            {/* Current path / URL preview text */}
            {value && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono truncate">
                <span className="shrink-0 text-slate-400">Current:</span>
                <span className="truncate text-slate-700">{value}</span>
                {value.startsWith('http') && (
                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 p-0.5 text-slate-400 hover:text-sky-600"
                    title="ပုံသီးသန့် ဖွင့်ကြည့်မည်"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Help text */}
            {helpText && (
              <p className="text-[11px] text-slate-500 leading-tight">
                {helpText}
              </p>
            )}
          </div>
        </div>

        {/* Manual URL Input drawer */}
        {allowManualUrl && showManualInput && (
          <div className="pt-2 border-t border-slate-200/80 space-y-1 animate-in fade-in duration-150">
            <span className="text-[11px] font-bold text-slate-600 block">
              Image URL တိုက်ရိုက် ရိုက်ထည့်ရန် (Manual Image URL / Local Asset Path):
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={value}
                disabled={disabled || isUploading}
                onChange={(e) => {
                  setImgLoadError(false);
                  onChange(e.target.value);
                }}
                placeholder="/src/assets/images/... သို့မဟုတ် https://..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden"
              />
              {value && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
                  title="URL ရှင်းလင်းမည်"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              * Local asset များ (/src/assets/images/...) သို့မဟုတ် ပြင်ပ HTTPS ဓာတ်ပုံလင့်ခ်များကို လက်ခံပါသည်
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

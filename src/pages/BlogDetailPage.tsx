import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  BookmarkCheck,
  Check,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
  MessageSquare
} from 'lucide-react';

export const BlogDetailPage: React.FC = () => {
  const { currentSlug, posts, categories, navigateTo, openConsultModal, settings } = useApp();
  const [copied, setCopied] = useState(false);

  const post = posts.find((p) => p.slug === currentSlug) || posts[0];
  const relatedPosts = posts.filter((p) => p.id !== post?.id && p.status === 'published').slice(0, 3);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-burmese space-y-4">
        <h2 className="text-xl font-bold text-slate-800">ဆောင်းပါးကို ရှာမတွေ့ပါ</h2>
        <button
          onClick={() => navigateTo('blog')}
          className="text-sm font-semibold text-sky-600 hover:underline"
        >
          ဆောင်းပါးများအားလုံးသို့ ပြန်သွားရန်
        </button>
      </div>
    );
  }

  const categoryName = categories.find((c) => c.id === post.categoryId)?.name || 'ဗဟုသုတ';

  const handleShare = (channel: 'facebook' | 'messenger' | 'whatsapp' | 'copy') => {
    const url = window.location.href;
    if (channel === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (channel === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + url)}`, '_blank');
    } else if (channel === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Convert raw content with simple markdown-like formatting for headings, warning boxes, and lists
  const renderFormattedContent = (content: string) => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.startsWith('### ⚠️ သတိပြုရန်')) {
        return (
          <div key={idx} className="my-6 p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-2">
            <h4 className="text-base font-bold text-amber-950 flex items-center gap-2">
              <span>⚠️ သတိပြုရန် (အရေးကြီးဆုံး အချက်များ)</span>
            </h4>
            <div className="text-sm text-amber-900 leading-relaxed font-burmese whitespace-pre-line">
              {trimmed.replace('### ⚠️ သတိပြုရန် (အရေးကြီးဆုံး အချက်များ)', '').trim()}
            </div>
          </div>
        );
      } else if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg sm:text-xl font-bold text-slate-900 mt-8 mb-3 font-burmese">
            {trimmed.replace('### ', '')}
          </h3>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ')) {
        return (
          <div key={idx} className="my-3 pl-2 text-sm sm:text-base text-slate-700 leading-relaxed font-burmese whitespace-pre-line">
            {trimmed}
          </div>
        );
      } else {
        return (
          <p key={idx} className="text-sm sm:text-base text-slate-700 leading-relaxed font-burmese">
            {trimmed}
          </p>
        );
      }
    });
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigateTo('blog')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors font-burmese"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ဆောင်းပါးများအားလုံးသို့ ပြန်သွားရန်</span>
        </button>
      </div>

      {/* Article Header */}
      <header className="space-y-4">
        {/* Zero-pill clean unboxed metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-burmese">
          <span className="font-semibold text-sky-700">{categoryName}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>တင်သည့်ရက်: {post.publishedAt}</span>
          </span>
          {post.updatedAt && post.updatedAt !== post.publishedAt && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700 font-medium flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                <span>နောက်ဆုံး Update: {post.updatedAt}</span>
              </span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readTimeMinutes || 4} မိနစ်ဖတ်ရန်</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-burmese leading-snug">
          {post.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 font-burmese leading-relaxed">
          {post.excerpt}
        </p>
      </header>

      {/* Cover Image */}
      <div className="rounded-3xl overflow-hidden shadow-md border border-slate-200 aspect-[16/9] bg-slate-100">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Article Body Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs space-y-5">
        <div className="space-y-4">
          {renderFormattedContent(post.content)}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs font-burmese">
            <span className="text-slate-500">ဆက်စပ်ခေါင်းစဉ်များ:</span>
            {post.tags.map((tag, idx) => (
              <span key={idx} className="text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Social Share Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-600 font-burmese">
            မိတ်ဆွေများထံ မျှဝေရန် (Share Article)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShare('facebook')}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium transition-colors"
            >
              Facebook
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium transition-colors"
            >
              WhatsApp
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium transition-colors"
            >
              {copied ? 'Link ကူးယူပြီး!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Helpful In-article CTA */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-4 font-burmese">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <BookmarkCheck className="w-4 h-4" />
          <span>Solution for You အကူအညီ</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white">
          ဤကိစ္စရပ်နှင့် ပတ်သက်ပြီး စာရွက်စာတမ်း အခက်အခဲ ရှိနေပါသလား?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          မိတ်ဆွေ၏ နိုင်ငံကူးလက်မှတ် သို့မဟုတ် စာရွက်စာတမ်းကို ဓာတ်ပုံရိုက်ပို့ပြီး Solution for You ထံ အခမဲ့ စစ်ဆေးတိုင်ပင်နိုင်ပါသည်။
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => openConsultModal(post.title)}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors"
          >
            အခမဲ့ တိုင်ပင်ဆွေးနွေးရန်
          </button>
          <a
            href={settings.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp ဖြင့် ဆက်သွယ်ရန်</span>
          </a>
        </div>
      </div>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <div className="space-y-4 pt-6">
          <h3 className="text-lg font-bold text-slate-900 font-burmese">အခြား အသုံးဝင်မည့် ဆောင်းပါးများ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => navigateTo('blog-detail', rel.slug)}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="aspect-[16/10] bg-slate-100 rounded-lg overflow-hidden">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-burmese line-clamp-2 leading-snug">
                    {rel.title}
                  </h4>
                </div>
                <div className="pt-2 text-[11px] font-semibold text-sky-700 font-burmese">
                  ဆက်ဖတ်ရန် →
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

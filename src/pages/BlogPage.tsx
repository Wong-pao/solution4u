import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Calendar, Clock, ChevronRight, BookmarkCheck, ArrowRight } from 'lucide-react';

export const BlogPage: React.FC = () => {
  const { posts, categories, navigateTo } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const publishedPosts = posts.filter((p) => p.status === 'published');

  const filteredPosts = publishedPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.categoryId === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = publishedPosts.find((p) => p.isFeatured) || publishedPosts[0];

  const getCategoryName = (catId: string) => {
    const found = categories.find((c) => c.id === catId);
    return found ? found.name : 'ဗဟုသုတ';
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-b from-sky-50/60 to-white pt-12 pb-14 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-700">
            KNOWLEDGE CENTER
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-burmese leading-snug">
            သုတစုံလင် ဗဟုသုတစင်တာ
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-burmese max-w-2xl mx-auto leading-relaxed">
            ထိုင်းနိုင်ငံရောက် မြန်မာမိတ်ဆွေများ နေ့စဉ်သိရှိထားသင့်သည့် ဗီဇာ၊ Work Permit၊ စာရွက်စာတမ်းနှင့် လဝက ဆိုင်ရာ လက်တွေ့အသုံးဝင် အချက်အလက်များ
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Functional filter buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none font-burmese">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-sky-600 text-white shadow-xs font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              အားလုံး ({publishedPosts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-xs font-semibold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ဆောင်းပါး ရှာဖွေရန်..."
              className="w-full pl-9 pr-3.5 py-2 text-xs font-burmese bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Featured Post Spotlight (shown when not filtering by search query) */}
        {!searchQuery && selectedCategory === 'all' && featuredPost && (
          <div
            onClick={() => navigateTo('blog-detail', featuredPost.slug)}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12"
          >
            <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto relative bg-slate-100 overflow-hidden">
              <img
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-sky-600 text-white px-3 py-1 rounded-lg text-xs font-semibold font-burmese shadow-sm">
                အထူးဆောင်းပါး
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Zero-pill metadata with dot separators */}
                <div className="flex items-center gap-2 text-xs text-slate-500 font-burmese">
                  <span className="font-semibold text-sky-700">{getCategoryName(featuredPost.categoryId)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featuredPost.publishedAt}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featuredPost.readTimeMinutes || 4} မိနစ်ဖတ်ရန်</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-sky-700 transition-colors font-burmese leading-snug">
                  {featuredPost.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-burmese line-clamp-3">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700 font-burmese">
                <span>ဆောင်းပါး အပြည့်အစုံ ဖတ်ရှုရန်</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        )}

        {/* Article Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => navigateTo('blog-detail', post.slug)}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-800 shadow-xs font-burmese">
                    {getCategoryName(post.categoryId)}
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  {/* Zero-pill metadata */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-burmese">
                    <span>{post.publishedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTimeMinutes || 4} မိနစ်ဖတ်ရန်</span>
                    {post.updatedAt && post.updatedAt !== post.publishedAt && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-600 font-medium">Update</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors font-burmese leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed font-burmese line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-1 flex items-center justify-between text-xs font-semibold text-sky-700 font-burmese border-t border-slate-50">
                <span>ဆက်ဖတ်ရန်</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3 font-burmese">
            <p className="text-slate-500 text-sm">ရှာဖွေမှုနှင့် ကိုက်ညီသော ဆောင်းပါး မတွေ့ရှိပါ။</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-sky-600 hover:underline"
            >
              ဆောင်းပါးအားလုံး ပြန်လည်ကြည့်ရှုရန်
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { Search, GraduationCap, Map, BookOpen, ExternalLink, HelpCircle, Calendar, Clock, Share2, BarChart3, Menu, X, Users, Mail, ArrowRight, Sparkles, QrCode } from 'lucide-react';
import { PORTAL_DATA } from './constants';
import { RegionCategory } from './types';
import { LinkCard } from './components/LinkCard';
import { CountdownTimer } from './components/CountdownTimer';
import { ShareModal } from './components/ShareModal';
import { PromotionModal } from './components/PromotionModal';
import { ResourceCard } from './components/ResourceCard';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RegionCategory | 'ALL'>('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsPromoModalOpen(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isDrawerOpen]);

  const categories = ['ALL', ...Object.values(RegionCategory)];

  const filteredLinks = useMemo(() => {
    return PORTAL_DATA.filter((link) => {
      const matchesSearch = 
        link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.tags.some(tag => tag.includes(searchTerm));
      
      const matchesCategory = selectedCategory === 'ALL' || link.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col relative bg-slate-50 selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-slate-900 focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white">跳至主要內容</a>
      
      {/* Aurora Background Effects */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Navbar - Floating Glass */}
      <nav aria-label="主要導覽" className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl h-16 px-6 flex items-center justify-between pointer-events-auto transition-all duration-300">
          <button type="button" className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} aria-label="回到頁面頂端">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">全國會考入口網</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 text-sm font-semibold text-slate-500 mr-2">
              <a href="articles.html" className="hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg hover:bg-white/50">文章專區</a>
              <a href="https://cap.rcpet.edu.tw/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/50">
                會考官網 <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="p-2.5 text-slate-600 hover:bg-white hover:text-indigo-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200 hover:shadow-md"
              aria-label="開啟更多資源選單"
              aria-expanded={isDrawerOpen}
              aria-controls="resource-menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Drawer Menu */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <button type="button" className="absolute inset-0 cursor-default bg-slate-950/35 backdrop-blur-md transition-opacity" onClick={() => setIsDrawerOpen(false)} aria-label="關閉更多資源選單" />
          <aside id="resource-menu" role="dialog" aria-modal="true" aria-labelledby="drawer-title" className="relative flex h-full w-[22rem] max-w-[92vw] flex-col overflow-hidden border-l border-white/70 bg-slate-50 shadow-[-20px_0_60px_-24px_rgba(15,23,42,.45)] animate-in slide-in-from-right duration-300 sm:w-[25rem]">
             <div className="relative overflow-hidden border-b border-slate-100 bg-white px-6 pb-7 pt-8">
               <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-indigo-200/45 blur-3xl" />
               <div className="relative flex items-center justify-between">
               <h2 id="drawer-title" className="text-xl font-bold text-slate-800">更多資源</h2>
               <button onClick={() => setIsDrawerOpen(false)} className="rounded-xl border border-slate-100 bg-white p-2 text-slate-400 shadow-sm transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700" aria-label="關閉選單">
                 <X className="w-6 h-6" />
               </button>
             </div>
             </div>
             
             <div className="flex-1 space-y-3 overflow-y-auto px-5 py-6">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">分析與分享</div>
               <DrawerLink href="https://tyctw.github.io/" icon={<BarChart3 className="w-5 h-5" />} label="會考落點分析" color="text-violet-600" bg="bg-violet-50" />
               <DrawerLink href="https://tyctw.github.io/score/" icon={<Share2 className="w-5 h-5" />} label="會考序位分享" color="text-emerald-600" bg="bg-emerald-50" />
               <DrawerLink href="https://tyctw.github.io/shared/" icon={<Users className="w-5 h-5" />} label="會考錄取分享" color="text-orange-600" bg="bg-orange-50" />

               <div className="my-6 h-px bg-slate-200" />
               
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">常用連結</div>
               <DrawerLink 
                    href="#" 
                    onClick={(e: React.MouseEvent) => { e.preventDefault(); setIsShareModalOpen(true); setIsDrawerOpen(false); }}
                    icon={<QrCode className="w-5 h-5" />} 
                    label="分享本網站" 
                    color="text-indigo-600" 
                    bg="bg-indigo-50"
               />
               <DrawerLink href="https://cap.rcpet.edu.tw/" icon={<ExternalLink className="w-5 h-5" />} label="國中會考官網" />
               <button 
                onClick={() => { window.location.href = 'articles.html'; }}
                className="group flex w-full items-center gap-4 rounded-2xl border border-transparent bg-white p-3.5 text-left font-bold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md"
               >
                 <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500 shadow-sm transition-transform group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                    <HelpCircle className="w-5 h-5" />
                 </div>
                 <span className="group-hover:text-slate-900 transition-colors">文章專區</span>
               </button>
             </div>
             
             <div className="mt-auto border-t border-slate-200 bg-white px-5 pb-6 pt-5 text-center">
               <a href="mailto:tyctw.analyze@gmail.com" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 p-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-indigo-600">
                  <Mail className="w-4 h-4" /> 聯繫我們
               </a>
               <p className="text-xs text-slate-400 mt-4 font-medium">© {new Date().getFullYear()} 全國會考入口網整合平台</p>
             </div>
          </aside>
        </div>
      )}

      {/* Modals */}
      <PromotionModal isOpen={isPromoModalOpen} onClose={() => setIsPromoModalOpen(false)} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
      <button onClick={() => setIsShareModalOpen(true)} className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-black text-white shadow-[0_18px_35px_-14px_rgba(15,23,42,.45)] transition hover:-translate-y-1 hover:bg-indigo-600 hover:shadow-indigo-500/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 sm:bottom-6 sm:right-6" aria-label="分享網站"><Share2 className="h-5 w-5" /><span className="hidden sm:inline">分享網站</span></button>

      {/* Hero Section */}
      <header className="relative overflow-visible px-4 pb-12 pt-28 sm:pt-32">
        <section className="relative z-10 mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/80 p-7 shadow-[0_28px_70px_-42px_rgba(67,56,202,.4)] backdrop-blur-xl sm:p-10 lg:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-14">
            <div className="text-center lg:text-left"><span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-black tracking-wide text-indigo-700"><Sparkles className="h-4 w-4" />116 學年度升學資訊</span><h1 className="mt-7 text-5xl font-black leading-[1.05] tracking-tighter text-slate-900 sm:text-6xl lg:text-7xl">國中教育會考<span className="mt-2 block bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">&amp; 志願選填</span></h1><span className="mt-5 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-base font-black text-slate-600">查詢網址</span><p className="mt-7 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg">彙整全國各就學區的志願選填、序位查詢與放榜查詢連結，快速找到您的考區，掌握升學關鍵時刻。</p><div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start"><a href="#main-content" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto">查看各區入口 <ArrowRight className="h-4 w-4" /></a><a href="schedule.html" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700 sm:w-auto"><Calendar className="h-4 w-4" />重要日程</a></div></div>
            <div className="rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-4 shadow-inner shadow-violet-100/50 sm:p-6"><div className="rounded-[1.5rem] border border-white bg-white/85 p-5 shadow-[0_16px_40px_-28px_rgba(79,70,229,.4)]"><CountdownTimer compact /><div className="mt-5 grid grid-cols-3 gap-2"><div className="rounded-2xl bg-indigo-50 p-3 text-center"><p className="text-[10px] font-black text-indigo-500">第一步</p><p className="mt-1 text-xs font-black text-slate-700">確認考區</p></div><div className="rounded-2xl bg-violet-50 p-3 text-center"><p className="text-[10px] font-black text-violet-500">第二步</p><p className="mt-1 text-xs font-black text-slate-700">查詢序位</p></div><div className="rounded-2xl bg-fuchsia-50 p-3 text-center"><p className="text-[10px] font-black text-fuchsia-500">第三步</p><p className="mt-1 text-xs font-black text-slate-700">安排志願</p></div></div><p className="mt-5 text-sm font-medium leading-6 text-slate-500">從掌握時程開始，循序完成每一個升學準備步驟。</p></div></div>
          </div>
        </section>
        <div className="hidden relative z-10 mx-auto flex max-w-7xl flex-col items-center overflow-hidden rounded-[2.5rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,.94),rgba(245,243,255,.78))] p-6 text-center shadow-[0_28px_70px_-42px_rgba(67,56,202,.45)] backdrop-blur-xl sm:p-10 lg:p-12">
          
          {/* Notification Badge */}
          <div className="mb-8 inline-flex cursor-default select-none items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-sm transition-colors hover:bg-indigo-100 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            116 學年度升學資訊同步更新中
          </div>

          {/* Main Title */}
          <div className="relative mb-8 grid w-full items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:text-left">
            <div className="relative px-3 py-5 text-center lg:px-6 lg:text-left">
              <h1 className="text-5xl font-black leading-[1.02] tracking-tighter text-slate-900 sm:text-6xl md:text-7xl">
                  國中教育會考
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 pb-2">
                      & 志願選填
                  </span>
                  <span className="relative mt-5 inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-5 py-2 text-lg text-indigo-700 shadow-sm sm:text-xl">
                      查詢網址
                      {/* Decorative underline */}
                      <svg className="hidden absolute w-full h-3 md:h-4 -bottom-1 left-0 text-indigo-400 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                          <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                      </svg>
                  </span>
              </h1>
              <div className="mt-7 flex max-w-3xl flex-col items-center gap-3 lg:items-start lg:text-left">
                <p className="text-base font-medium leading-7 text-slate-600 sm:text-lg">彙整全國各就學區的<span className="mx-1 font-black text-indigo-600">志願選填</span>、<span className="mx-1 font-black text-indigo-600">序位查詢</span>與<span className="mx-1 font-black text-indigo-600">放榜查詢</span>連結。</p>
                <p className="inline-flex items-center gap-2 text-sm font-black text-violet-700"><Sparkles className="h-4 w-4" />快速找到您的考區，掌握升學關鍵時刻</p>
              </div>
              
              {/* Decorative elements behind title */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
            </div>
            <CountdownTimer compact />
          </div>
          
          {/* Search Box Container */}
          <div className="group relative z-20 mt-8 w-full max-w-3xl">
             <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] opacity-30 blur group-hover:opacity-50 transition duration-500"></div>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-16 pr-6 py-5 bg-white text-slate-800 rounded-[1.7rem] shadow-xl border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all text-lg placeholder:text-slate-400 font-medium"
                  placeholder="搜尋區域（如：台北、高雄、花蓮...）"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
          
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-24 sm:px-6 lg:px-8">
        
        {/* Important Dates Ticker Card */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-sm border border-white/60 p-1.5 mb-16 relative overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-white to-orange-50/50 rounded-2xl border border-orange-100/50 flex flex-col md:flex-row items-center justify-between p-5 md:px-8 gap-6">
                <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="bg-gradient-to-br from-orange-400 to-red-500 p-3.5 rounded-2xl text-white shadow-lg shadow-orange-500/30 shrink-0">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="font-bold text-slate-800 text-lg">重要日程快訊</h3>
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide shadow-md shadow-red-500/20">熱門</span>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 font-medium">
                            <span className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-md border border-white"><Clock className="w-3.5 h-3.5 text-orange-500" /> 個人序位：116/06/18</span>
                            <span className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-md border border-white"><BookOpen className="w-3.5 h-3.5 text-blue-500" /> 志願選填：116/06/18 - 116/06/25</span>
                        </div>
                    </div>
                </div>
                <a
                    href="schedule.html"
                    className="w-full md:w-auto px-6 py-3.5 bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group/btn"
                >
                    查看完整時程
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </a>
            </div>
        </div>

        {/* Resources Grid (Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <ResourceCard 
                href="https://tyctw.github.io/score/"
                icon={<Share2 className="w-7 h-7" />}
                title="會考序位分享"
                desc="分享你的成績與序位，讓真實資料幫更多人找到適合的志願。"
                fromColor="from-emerald-400"
                toColor="to-teal-500"
                shadowColor="shadow-emerald-500/30"
            />
            <ResourceCard 
                href="https://tyctw.github.io/"
                icon={<BarChart3 className="w-7 h-7" />}
                title="會考落點分析"
                desc="輸入會考成績，快速掌握可能錄取的學校與選填方向。"
                fromColor="from-violet-400"
                toColor="to-purple-500"
                shadowColor="shadow-purple-500/30"
            />
            <ResourceCard 
                href="https://tyctw.github.io/shared/"
                icon={<Users className="w-7 h-7" />}
                title="會考錄取分享"
                desc="查看真實錄取結果與志願序，選填前多一份有依據的參考。"
                fromColor="from-orange-400"
                toColor="to-amber-500"
                shadowColor="shadow-orange-500/30"
            />
        </div>

        {/* Filters */}
        <div className="flex flex-col items-center mb-12 space-y-5">
            <h3 className="text-slate-400 text-xs font-black tracking-[0.25em] bg-white/50 px-4 py-1 rounded-full border border-white">選擇考區</h3>
            <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
                <button
                key={cat}
                onClick={() => setSelectedCategory(cat as RegionCategory | 'ALL')}
                aria-pressed={selectedCategory === cat}
                className={`px-6 py-3 rounded-2xl text-sm font-black transition-all duration-300 backdrop-blur-sm ${
                    selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105'
                    : 'bg-white/60 text-slate-600 hover:bg-white hover:text-indigo-600 border border-white/60 shadow-sm hover:shadow-md'
                }`}
                >
                {cat === 'ALL' ? '全部' : cat}
                </button>
            ))}
            </div>
        </div>

        {/* Links Grid */}
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/30"></div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        {selectedCategory === 'ALL' ? '所有區域' : `${selectedCategory}區域`}列表
                    </h2>
                </div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                    {filteredLinks.length} results
                </span>
            </div>

            {selectedCategory === 'ALL' && (
              <section className="hidden grid gap-3 rounded-[1.75rem] border border-violet-100 bg-violet-50/55 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4" aria-label="選填文章推薦">
                <a href="guide.html" className="group rounded-2xl border border-white bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><BookOpen className="h-4 w-4" /></span><p className="mt-3 text-[10px] font-black tracking-[0.13em] text-indigo-600">第一次選填？</p><h3 className="mt-1 text-sm font-black text-slate-800">別急著填！先搞懂志願排序</h3><p className="mt-1 text-xs font-medium leading-5 text-slate-500">從準備到送出，避免把最想讀的學校排錯位置。</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-indigo-600">立即看攻略 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span></a>
                <a href="ranking.html" className="group rounded-2xl border border-white bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><BarChart3 className="h-4 w-4" /></span><p className="mt-3 text-[10px] font-black tracking-[0.13em] text-violet-600">成績公布後</p><h3 className="mt-1 text-sm font-black text-slate-800">你的序位，能填到哪裡？</h3><p className="mt-1 text-xs font-medium leading-5 text-slate-500">用個人序位判讀落點，把有機會的志願排進清單。</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-violet-600">看懂序位 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span></a>
                <a href="after-submission.html" className="group rounded-2xl border border-white bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Calendar className="h-4 w-4" /></span><p className="mt-3 text-[10px] font-black tracking-[0.13em] text-emerald-600">送出還沒結束</p><h3 className="mt-1 text-sm font-black text-slate-800">送出志願後，還有三件事別忘了</h3><p className="mt-1 text-xs font-medium leading-5 text-slate-500">放榜、報到與後續流程一次掌握，避免錯過關鍵日期。</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-emerald-600">查看清單 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span></a>
              </section>
            )}

            {filteredLinks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLinks.map((link) => (
                <LinkCard key={link.id} link={link} />
                ))}
            </div>
            ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white/60 backdrop-blur-md rounded-3xl border border-dashed border-slate-300">
                <div className="bg-slate-100 p-5 rounded-full mb-4">
                    <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">找不到相關區域</h3>
                <button 
                    onClick={() => {setSearchTerm(''); setSelectedCategory('ALL');}}
                    className="mt-4 text-indigo-600 font-bold hover:underline text-sm"
                >
                    清除搜尋條件
                </button>
            </div>
            )}

            {selectedCategory === 'ALL' && filteredLinks.length > 0 && (
              <section className="grid gap-3 rounded-[1.75rem] border border-violet-100 bg-violet-50/55 p-4 sm:grid-cols-3 sm:gap-4 sm:p-5" aria-label="選填文章推薦">
                <div className="flex flex-col gap-1 px-1 pb-1 sm:col-span-3"><p className="text-xs font-black tracking-[0.14em] text-violet-600">延伸閱讀</p><h3 className="text-xl font-black tracking-tight text-slate-800">選填前後，這三篇先看</h3><p className="text-sm font-medium leading-6 text-slate-500">用幾分鐘掌握排序、序位與送出後的關鍵提醒。</p></div>
                <a href="guide.html" className="group rounded-2xl border border-white bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><BookOpen className="h-4 w-4" /></span><p className="mt-3 text-[10px] font-black tracking-[0.13em] text-indigo-600">第一次選填？</p><h3 className="mt-1 text-sm font-black text-slate-800">別急著填！先搞懂志願排序</h3><p className="mt-1 text-xs font-medium leading-5 text-slate-500">從準備到送出，避免把最想讀的學校排錯位置。</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-indigo-600">立即看攻略 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span></a>
                <a href="ranking.html" className="group rounded-2xl border border-white bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><BarChart3 className="h-4 w-4" /></span><p className="mt-3 text-[10px] font-black tracking-[0.13em] text-violet-600">成績公布後</p><h3 className="mt-1 text-sm font-black text-slate-800">你的序位，能填到哪裡？</h3><p className="mt-1 text-xs font-medium leading-5 text-slate-500">用個人序位判讀落點，把有機會的志願排進清單。</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-violet-600">看懂序位 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span></a>
                <a href="after-submission.html" className="group rounded-2xl border border-white bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Calendar className="h-4 w-4" /></span><p className="mt-3 text-[10px] font-black tracking-[0.13em] text-emerald-600">送出還沒結束</p><h3 className="mt-1 text-sm font-black text-slate-800">送出志願後，還有三件事別忘了</h3><p className="mt-1 text-xs font-medium leading-5 text-slate-500">放榜、報到與後續流程一次掌握，避免錯過關鍵日期。</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-emerald-600">查看清單 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span></a>
              </section>
            )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-lg border-t border-slate-200 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-8 text-slate-800 font-bold text-2xl tracking-tight">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
                    <GraduationCap className="w-6 h-6" />
                </div>
                全國會考入口網
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 mb-8 text-sm font-bold text-slate-500">
                <a href="articles.html" className="hover:text-indigo-600 transition-colors">文章專區</a>
                <a href="https://cap.rcpet.edu.tw/" target="_blank" className="hover:text-indigo-600 transition-colors">官方網站</a>
                <a href="mailto:tyctw.analyze@gmail.com" className="hover:text-indigo-600 transition-colors flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    tyctw.analyze@gmail.com
                </a>
            </div>

            <p className="text-slate-400 text-xs max-w-lg mx-auto leading-relaxed mb-6 font-medium">
                本網站僅提供連結彙整，實際日程與規定請以國中教育會考全國試務會及各就學區免試入學委員會公告為準。
            </p>
            
            <p className="text-xs text-slate-400 font-semibold">
                © {new Date().getFullYear()} TYCTW會考落點分析版權所有
            </p>
        </div>
      </footer>
    </div>
  );
};

// Sub-components for cleaner code
const DrawerLink = ({ href, onClick, icon, label, color = "text-slate-400", bg = "bg-slate-50" }: any) => (
  <a 
    href={href} 
    onClick={onClick}
    target={href.startsWith('http') ? "_blank" : "_self"}
    rel={href.startsWith('http') ? "noopener noreferrer" : ""}
    className="group flex items-center gap-4 rounded-2xl border border-transparent bg-white p-3.5 font-bold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md"
  >
    <div className={`rounded-xl p-2.5 ${bg} ${color} shadow-sm transition-transform group-hover:scale-110`}>
        {icon}
    </div>
    <span className="group-hover:text-slate-900 transition-colors">{label}</span>
  </a>
);

const LegacyResourceCard = ({ href, icon, title, desc, fromColor, toColor, shadowColor }: any) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={`group relative bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:${shadowColor} hover:-translate-y-2 transition-all duration-300 flex flex-col h-full overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${fromColor} ${toColor} rounded-full blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 -mr-10 -mt-10`}></div>
      
      <div className={`w-16 h-16 bg-gradient-to-br ${fromColor} ${toColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg text-white relative z-10`}>
          {icon}
      </div>
      <h3 className="font-bold text-xl text-slate-800 mb-3 relative z-10">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 relative z-10 font-medium">{desc}</p>
      <div className={`flex items-center text-slate-800 text-sm font-black mt-auto relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${fromColor} ${toColor} transition-all`}>
          立即前往 <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform text-current" />
      </div>
  </a>
);

export default App;

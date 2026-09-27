import React, { useEffect, useRef } from 'react';
import { AtSign, BarChart3, BookOpen, Calculator, Compass, ExternalLink, GraduationCap, Heart, Instagram, PlusCircle, Search, Share2, Table2, X } from 'lucide-react';

type MenuTab = 'list' | 'minimums' | 'stats' | 'insights' | 'form' | 'favorites';

type MobileMenuProps = {
  isOpen: boolean;
  activeTab: string;
  favoriteCount: number;
  onClose: () => void;
  onNavigate: (tab: MenuTab) => void;
  onShare: () => void;
  onExternalLink: (name: string) => void;
};

const sections = [
  {
    title: '查詢資料',
    items: [
      { id: 'list', label: '瀏覽錄取資料', description: '查詢學校與錄取成績', icon: BookOpen, tone: 'bg-indigo-50 text-indigo-600' },
      { id: 'minimums', label: '各校最低分數', description: '快速比較歷年門檻', icon: Table2, tone: 'bg-sky-50 text-sky-600' },
    ],
  },
  {
    title: '分析規劃',
    items: [
      { id: 'stats', label: '會考統計資料', description: '掌握成績分布', icon: BarChart3, tone: 'bg-violet-50 text-violet-600' },
      { id: 'insights', label: '會考志願策略', description: '規劃志願排序', icon: Compass, tone: 'bg-amber-50 text-amber-600' },
    ],
  },
] as const;

const externalLinks = [
  { label: '會考查榜', href: 'https://tyctw.github.io/front/', event: 'exam_results', icon: Search },
  { label: '落點分析', href: 'https://tyctw.github.io/spare/', event: 'spare_analysis', icon: Calculator },
  { label: '更多資訊', href: 'https://tyctw.github.io/Navigation/', event: 'navigation_info', icon: ExternalLink },
  { label: '小額支持', href: 'https://tyctw.github.io/spare/support/', event: 'small_support', icon: Heart },
] as const;

export default function MobileMenu({ isOpen, activeTab, favoriteCount, onClose, onNavigate, onShare, onExternalLink }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      }
      if (event.key !== 'Tab' || !menuRef.current) return;
      const focusable = Array.from(menuRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const menuItemClass = 'flex min-h-16 w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500';

  return (
    <div ref={menuRef} role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title" className="fixed inset-0 z-[70] flex flex-col bg-slate-50 md:hidden">
      <div className="shrink-0 border-b border-slate-200/80 bg-white px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white"><GraduationCap className="h-6 w-6" /></span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-500">會考錄取分享平台</p>
              <h2 id="mobile-menu-title" className="text-xl font-black text-slate-900">探索功能</h2>
            </div>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="關閉功能選單" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"><X className="h-6 w-6" /></button>
        </div>
      </div>

      <nav aria-label="手機功能選單" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-xl space-y-5">
          {sections.map((section) => (
            <section key={section.title} aria-label={section.title} className="rounded-3xl border border-slate-200/80 bg-white p-3 shadow-sm">
              <h3 className="px-3 pb-2 pt-1 text-xs font-black tracking-widest text-slate-500">{section.title}</h3>
              {section.items.map(({ id, label, description, icon: Icon, tone }) => (
                <button key={id} type="button" onClick={() => onNavigate(id)} aria-current={activeTab === id ? 'page' : undefined} className={`${menuItemClass} ${activeTab === id ? 'bg-indigo-50' : ''}`}>
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-black text-slate-900">{label}</span><span className="block text-xs text-slate-500">{description}</span></span>
                  {activeTab === id && <span className="rounded-full bg-indigo-600 px-2 py-1 text-[10px] font-bold text-white">目前</span>}
                </button>
              ))}
            </section>
          ))}

          <section aria-label="分享與收藏" className="rounded-3xl border border-slate-200/80 bg-white p-3 shadow-sm">
            <h3 className="px-3 pb-2 pt-1 text-xs font-black tracking-widest text-slate-500">分享與收藏</h3>
            <button type="button" onClick={() => onNavigate('form')} aria-current={activeTab === 'form' ? 'page' : undefined} className={`${menuItemClass} ${activeTab === 'form' ? 'bg-indigo-50' : ''}`}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><PlusCircle className="h-5 w-5" /></span><span className="flex-1 text-sm font-black text-slate-900">分享錄取結果</span></button>
            <button type="button" onClick={onShare} className={menuItemClass}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Share2 className="h-5 w-5" /></span><span className="flex-1 text-sm font-black text-slate-900">分享這個網站</span></button>
            {favoriteCount > 0 && <button type="button" onClick={() => onNavigate('favorites')} aria-current={activeTab === 'favorites' ? 'page' : undefined} className={`${menuItemClass} ${activeTab === 'favorites' ? 'bg-indigo-50' : ''}`}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><Heart className="h-5 w-5" /></span><span className="flex-1 text-sm font-black text-slate-900">查看收藏</span><span className="text-xs font-bold text-slate-500">{favoriteCount} 筆</span></button>}
          </section>

          <section aria-label="相關服務" className="px-1">
            <h3 className="px-2 pb-3 text-xs font-black tracking-widest text-slate-500">相關服務</h3>
            <div className="grid grid-cols-2 gap-2">
              {externalLinks.map(({ label, href, event, icon: Icon }) => <a key={event} href={href} target="_blank" rel="noopener noreferrer" onClick={() => onExternalLink(event)} className="flex min-h-14 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"><Icon className="h-4 w-4 shrink-0 text-indigo-600" />{label}<ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-400" /></a>)}
            </div>
          </section>

          <div className="flex justify-center gap-5 pb-2 text-xs font-bold text-slate-500">
            <a href="https://www.instagram.com/exam.tw/" target="_blank" rel="noopener noreferrer" onClick={() => onExternalLink('instagram')} className="flex min-h-11 items-center gap-1.5"><Instagram className="h-4 w-4" />Instagram</a>
            <a href="https://www.threads.com/@exam.tw" target="_blank" rel="noopener noreferrer" onClick={() => onExternalLink('threads')} className="flex min-h-11 items-center gap-1.5"><AtSign className="h-4 w-4" />Threads</a>
          </div>
        </div>
      </nav>
    </div>
  );
}

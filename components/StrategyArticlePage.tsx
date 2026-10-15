import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { ALL_STRATEGY_ARTICLES } from '../data/strategyArticles';
import { articleHref, pageHref, resolvePageRoute, type ActiveTab } from '../utils/pageRoutes';

interface Props {
  slug: string;
  onBack: () => void;
  onNavigate: (tab: ActiveTab) => void;
  onOpenArticle: (slug: string) => void;
}
export default function StrategyArticlePage({ slug, onBack, onNavigate, onOpenArticle }: Props) {
  const article = ALL_STRATEGY_ARTICLES.find(item => item.slug === slug);
  const base = resolvePageRoute(window.location.pathname).base;
  const intercept = (event: React.MouseEvent<HTMLAnchorElement>, navigate: () => void) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault(); navigate();
  };
  useEffect(() => {
    let frame: number | null = null;
    const scrollToSection = () => {
      const id = window.location.hash.slice(1);
      if (!/^article-(section-[1-4]|practice|sources)$/.test(id)) return;
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
    };
    scrollToSection();
    window.addEventListener('hashchange', scrollToSection);
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', scrollToSection);
    };
  }, [slug]);

  const backLink = <a href={pageHref('insights', base)} onClick={event => intercept(event, onBack)} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-900"><ArrowLeft aria-hidden="true" className="h-4 w-4" />返回策略文章</a>;
  if (!article) return <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-9"><h2 className="text-2xl font-bold text-slate-900">找不到這篇策略文章</h2><p className="my-5 text-sm leading-7 text-slate-500">網址可能不完整，請返回策略首頁選擇文章。</p>{backLink}</section>;
  const index = ALL_STRATEGY_ARTICLES.indexOf(article);
  const readMinutes = Math.max(1, Math.ceil(article.sections.reduce((total, section) => total + section.paragraphs.join('').length, 0) / 350));
  const siblings = [ALL_STRATEGY_ARTICLES[index - 1], ALL_STRATEGY_ARTICLES[index + 1]].filter(Boolean);
  const sectionHref = (id: string) => `${articleHref(slug, base)}#${id}`;

  return <article className="mx-auto max-w-4xl space-y-6" aria-labelledby="strategy-article-title">
    {backLink}
    <header className="rounded-2xl border border-slate-200 bg-white px-5 py-7 sm:px-9 sm:py-9">
      <p className="text-xs leading-6 text-slate-500"><span className="font-semibold text-cyan-700">{article.category}</span><span className="mx-2">·</span>閱讀約 {readMinutes} 分鐘<span className="mx-2">·</span>整理於 2026/10/15</p>
      <h2 id="strategy-article-title" className="mt-4 text-2xl font-bold leading-10 tracking-tight text-slate-900 sm:text-4xl sm:leading-snug">{article.title}</h2>
      <p className="mt-4 text-base leading-8 text-slate-500">{article.summary}</p>
    </header>

    <nav aria-label="文章目錄" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><h3 className="font-semibold text-slate-900">本篇重點</h3><ol className="mt-3 space-y-2">{article.sections.map((section, i) => <li key={section.heading}><a href={sectionHref(`article-section-${i + 1}`)} className="block rounded-lg py-1.5 text-sm leading-6 text-slate-600 hover:text-cyan-700">{i + 1}. {section.heading}</a></li>)}</ol></nav>

    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 sm:px-9 sm:py-9"><div className="mx-auto max-w-3xl space-y-8">
      {article.sections.map((section, i) => <section id={`article-section-${i + 1}`} className="scroll-mt-28" key={section.heading}><h3 className="text-lg font-bold leading-8 text-slate-900 sm:text-xl">{section.heading}</h3><div className="mt-3 space-y-4">{section.paragraphs.map(paragraph => <p key={paragraph} className="text-[15px] leading-8 text-slate-600 sm:text-base">{paragraph}</p>)}</div></section>)}
      <aside id="article-practice" className="scroll-mt-28 rounded-xl border border-cyan-100 bg-cyan-50/50 p-5"><h3 className="font-bold text-cyan-900">{article.practice.title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{article.practice.body}</p></aside>
      <section><h3 className="font-bold text-slate-900">讀完後，確認這三件事</h3><ul className="mt-4 space-y-3">{article.checklist.map(item => <li key={item} className="flex items-start gap-2 text-sm leading-7 text-slate-600"><CheckCircle2 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul></section>
      <section id="article-sources" className="scroll-mt-28 border-t border-slate-100 pt-6"><h3 className="font-bold text-slate-800">官方參考與適用範圍</h3><ul className="mt-4 space-y-4">{article.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-sm font-medium leading-7 text-cyan-700 underline underline-offset-4">{source.title}<ExternalLink aria-hidden="true" className="mt-1.5 h-3.5 w-3.5 shrink-0" /></a><p className="mt-1 text-xs leading-6 text-slate-500">{source.note}</p></li>)}</ul><p className="mt-4 text-xs leading-7 text-slate-500">本文的練習與比較方法為本站整理。涉及資格、名額、比序及期限時，請核對當年度、所在就學區與入學管道的正式公告。</p></section>
      <a href={pageHref(article.action.tab, base)} onClick={event => intercept(event, () => onNavigate(article.action.tab))} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700">{article.action.label}<ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
    </div></div>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby="related-articles-title"><h3 id="related-articles-title" className="font-bold text-slate-900">繼續閱讀</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{siblings.map(item => <a key={item.slug} href={articleHref(item.slug, base)} onClick={event => intercept(event, () => onOpenArticle(item.slug))} className="rounded-xl bg-slate-50 p-4 hover:bg-cyan-50"><p className="text-xs text-cyan-700">{item.category}</p><p className="mt-2 text-sm font-semibold leading-7 text-slate-800">{item.title}</p></a>)}</div><div className="mt-5 border-t border-slate-100 pt-5">{backLink}</div></section>
  </article>;
}

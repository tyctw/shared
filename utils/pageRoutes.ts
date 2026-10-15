import { ALL_STRATEGY_ARTICLES } from '../data/strategyArticles';

export const PAGE_ROUTES = {
  list: { path: '', title: '瀏覽錄取資料' },
  minimums: { path: 'minimums', title: '各校最低分數' },
  stats: { path: 'statistics', title: '會考統計資料' },
  insights: { path: 'insights', title: '會考志願策略' },
  form: { path: 'submit', title: '分享錄取結果' },
  favorites: { path: 'favorites', title: '我的收藏' },
  compare: { path: 'compare', title: '成績比較' },
  guide: { path: 'guide', title: '使用說明' },
  disclaimer: { path: 'disclaimer', title: '免責聲明' },
  privacy: { path: 'privacy', title: '隱私權與版權聲明' },
} as const;
export type ActiveTab = keyof typeof PAGE_ROUTES;
export type PageRoute = { tab: ActiveTab; base: string; articleSlug?: string };

export function resolvePageRoute(pathname: string): PageRoute {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[parts.length - 1] === 'index.html') parts.pop();
  if (parts[parts.length - 2] === 'insights') {
    const articleSlug = parts.pop()!;
    parts.pop();
    return { tab: 'insights', base: `/${parts.length ? `${parts.join('/')}/` : ''}`, articleSlug };
  }
  // Old list URLs now resolve to the site's root.
  if (['score', 'scores'].includes(parts[parts.length - 1])) parts.pop();
  const route = Object.entries(PAGE_ROUTES).find(([, value]) => value.path === parts[parts.length - 1]);
  if (route) parts.pop();
  return { tab: (route?.[0] as ActiveTab | undefined) ?? 'list', base: `/${parts.length ? `${parts.join('/')}/` : ''}` };
}

export function resolveInitialPageRoute(pathname: string, hash: string): PageRoute {
  const route = resolvePageRoute(pathname);
  if (route.tab !== 'insights' || route.articleSlug) return route;
  const legacyArticle = ALL_STRATEGY_ARTICLES.find(article => hash === `#article-${article.slug}`);
  return legacyArticle ? { ...route, articleSlug: legacyArticle.slug } : route;
}

export function pageHref(tab: ActiveTab, base: string, articleSlug?: string): string {
  if (tab === 'list') return base;
  return `${base}${PAGE_ROUTES[tab].path}/${tab === 'insights' && articleSlug ? `${encodeURIComponent(articleSlug)}/` : ''}`;
}
export const articleHref = (slug: string, base: string) => pageHref('insights', base, slug);

export function getPageMetadata(tab: ActiveTab, articleSlug?: string) {
  if (tab === 'insights' && articleSlug) {
    const article = ALL_STRATEGY_ARTICLES.find(item => item.slug === articleSlug);
    return { title: article?.title ?? '找不到策略文章', description: article?.summary ?? '請返回策略首頁，查看志願選填與資料判讀文章。' };
  }
  return { title: PAGE_ROUTES[tab].title, description: tab === 'insights'
    ? '閱讀志願排序、少量樣本判讀、適性選校、同分比序及報到清單，附實作練習與官方參考來源。'
    : `${PAGE_ROUTES[tab].title}：整理考生匿名回報的會考成績與高中職錄取經驗，協助比較升學選擇。` };
}

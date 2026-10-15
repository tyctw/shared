export const PAGE_ROUTES = {
  list: { path: 'scores', title: '瀏覽錄取資料' },
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

export function resolvePageRoute(pathname: string): { tab: ActiveTab; base: string } {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[parts.length - 1] === 'index.html') parts.pop();
  const route = Object.entries(PAGE_ROUTES).find(([, value]) => value.path === parts[parts.length - 1]);
  if (route) parts.pop();
  return {
    tab: (route?.[0] as ActiveTab | undefined) ?? 'list',
    base: `/${parts.length ? `${parts.join('/')}/` : ''}`,
  };
}

export function pageHref(tab: ActiveTab, base: string): string {
  return `${base}${PAGE_ROUTES[tab].path}/`;
}

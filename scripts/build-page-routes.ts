import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { PAGE_ROUTES, getPageMetadata, type ActiveTab } from '../utils/pageRoutes';
import { ALL_STRATEGY_ARTICLES } from '../data/strategyArticles';

const html = await readFile('dist/index.html', 'utf8');
const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const routes = [
  ...Object.entries(PAGE_ROUTES).map(([tab, route]) => ({ path: route.path, ...getPageMetadata(tab as ActiveTab) })),
  ...ALL_STRATEGY_ARTICLES.map(article => ({ path: `insights/${article.slug}`, ...getPageMetadata('insights', article.slug) })),
];
for (const { path, title, description } of routes) {
  const url = `https://tyctw.github.io/shared/${path}/`;
  const base = '../'.repeat(path.split('/').length);
  const pageTitle = escapeHtml(`${title}｜會考錄取分享平台`);
  const page = html
    .replace('<head>', `<head>\n    <base href="${base}" />`)
    .replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`)
    .replace(/(<meta name="description" content=")[^"]+/, `$1${escapeHtml(description)}`)
    .replace(/(<meta property="og:description" content=")[^"]+/, `$1${escapeHtml(description)}`)
    .replace(/(<meta name="twitter:description" content=")[^"]+/, `$1${escapeHtml(description)}`)
    .replace(/(<meta property="og:title" content=")[^"]+/, `$1${pageTitle}`)
    .replace(/(<meta name="twitter:title" content=")[^"]+/, `$1${pageTitle}`)
    .replace(/(<link rel="canonical" href=")[^"]+/, `$1${url}`)
    .replace(/(<link rel="alternate" hreflang="zh-Hant-TW" href=")[^"]+/, `$1${url}`)
    .replace(/(<meta property="og:url" content=")[^"]+/, `$1${url}`)
    .replace(/(<meta name="twitter:url" content=")[^"]+/, `$1${url}`);
  await mkdir(`dist/${path}`, { recursive: true });
  await writeFile(`dist/${path}/index.html`, page);
}
console.log(`Created ${routes.length} page entry files.`);

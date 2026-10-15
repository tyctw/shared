import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { PAGE_ROUTES } from '../utils/pageRoutes';

// Real entry files allow direct links and refreshes on GitHub Pages without rewrites.
const html = await readFile('dist/index.html', 'utf8');
for (const { path, title } of Object.values(PAGE_ROUTES)) {
  const url = `https://tyctw.github.io/shared/${path}/`;
  const page = html
    .replace('<head>', '<head>\n    <base href="../" />')
    .replace(/<title>.*?<\/title>/, `<title>${title}｜會考錄取分享平台</title>`)
    .replace(/(<link rel="canonical" href=")[^"]+/, `$1${url}`)
    .replace(/(<link rel="alternate" hreflang="zh-Hant-TW" href=")[^"]+/, `$1${url}`)
    .replace(/(<meta property="og:url" content=")[^"]+/, `$1${url}`)
    .replace(/(<meta name="twitter:url" content=")[^"]+/, `$1${url}`);
  await mkdir(`dist/${path}`, { recursive: true });
  await writeFile(`dist/${path}/index.html`, page);
}
console.log(`Created ${Object.keys(PAGE_ROUTES).length} page entry files.`);

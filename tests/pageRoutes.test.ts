import assert from 'node:assert/strict';
import test from 'node:test';
import { PAGE_ROUTES, pageHref, resolvePageRoute } from '../utils/pageRoutes';

test('each route round-trips at root and GitHub Pages deployment base', () => {
  for (const tab of Object.keys(PAGE_ROUTES) as (keyof typeof PAGE_ROUTES)[]) {
    for (const base of ['/', '/shared/']) {
      const href = pageHref(tab, base);
      assert.deepEqual(resolvePageRoute(href), { tab, base });
      assert.deepEqual(resolvePageRoute(href.slice(0, -1)), { tab, base });
      assert.deepEqual(resolvePageRoute(`${href}index.html`), { tab, base });
    }
  }
});

test('original home URL remains an alias for the score list', () => {
  assert.deepEqual(resolvePageRoute('/'), { tab: 'list', base: '/' });
  assert.deepEqual(resolvePageRoute('/shared/'), { tab: 'list', base: '/shared/' });
  assert.deepEqual(resolvePageRoute('/shared/index.html'), { tab: 'list', base: '/shared/' });
});

test('all paths are distinct', () => {
  const paths = Object.values(PAGE_ROUTES).map(route => route.path);
  assert.equal(new Set(paths).size, paths.length);
});

test('each article resolves independently under root and subdirectory deployments', async () => {
  const { ALL_STRATEGY_ARTICLES } = await import('../data/strategyArticles');
  const { articleHref, getPageMetadata, resolveInitialPageRoute } = await import('../utils/pageRoutes');
  for (const article of ALL_STRATEGY_ARTICLES) {
    for (const base of ['/', '/shared/']) {
      const href = articleHref(article.slug, base);
      const expected = { tab: 'insights', base, articleSlug: article.slug };
      assert.deepEqual(resolvePageRoute(href), expected);
      assert.deepEqual(resolvePageRoute(href.slice(0, -1)), expected);
      assert.deepEqual(resolvePageRoute(`${href}index.html`), expected);
      assert.deepEqual(resolveInitialPageRoute(`${base}insights/`, `#article-${article.slug}`), expected);
    }
    assert.equal(getPageMetadata('insights', article.slug).title, article.title);
    assert.equal(getPageMetadata('insights', article.slug).description, article.summary);
  }
});

test('unknown article retains its parent route for a useful not-found page', () => {
  assert.deepEqual(resolvePageRoute('/shared/insights/missing/'), { tab: 'insights', base: '/shared/', articleSlug: 'missing' });
});

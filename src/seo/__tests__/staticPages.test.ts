import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PAGES, PAGE_ROUTES, canonicalUrl } from '../routes';
import { pageFileName, renderPageHtml, renderSitemap } from '../staticPages';

const root = path.resolve(__dirname, '../../..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf-8');

// Routes that exist in the app but should not be indexed
const NON_INDEXED_PATHS = ['/error', '*'];

describe('routes', () => {
  it('covers every public <Route> in App.tsx', () => {
    const appSource = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf-8');
    const appPaths = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((p) => !NON_INDEXED_PATHS.includes(p));

    expect(PAGE_ROUTES.map((route) => route.path).sort()).toEqual(appPaths.sort());
  });

  it('builds canonical URLs without trailing slashes except for the root', () => {
    expect(canonicalUrl('/')).toBe('https://darkskycalculator.com/');
    expect(canonicalUrl('/faq')).toBe('https://darkskycalculator.com/faq');
  });
});

describe('renderPageHtml', () => {
  const html = renderPageHtml(indexHtml, PAGES.faq);

  it('sets the title, description and canonical for the route', () => {
    expect(html).toContain('<title>FAQ - darkSky Calculator</title>');
    expect(html).toContain('<link rel="canonical" href="https://darkskycalculator.com/faq" />');
    expect(html).toContain(`<meta name="description" content="${PAGES.faq.description}" />`);
  });

  it('sets Open Graph and Twitter tags for the route', () => {
    expect(html).toContain('<meta property="og:url" content="https://darkskycalculator.com/faq" />');
    expect(html).toContain('<meta property="og:title" content="FAQ - darkSky Calculator" />');
    expect(html).toContain('<meta name="twitter:url" content="https://darkskycalculator.com/faq" />');
    expect(html).toContain('<meta name="twitter:title" content="FAQ - darkSky Calculator" />');
  });

  it('leaves no homepage canonical behind', () => {
    expect(html).not.toContain('href="https://darkskycalculator.com/"');
  });

  it('escapes HTML special characters', () => {
    expect(renderPageHtml(indexHtml, PAGES.partners)).toContain(
      '<title>Partners &amp; Resources - darkSky Calculator</title>'
    );
  });

  it('throws if index.html is missing an expected tag', () => {
    expect(() => renderPageHtml('<html></html>', PAGES.faq)).toThrow(/could not find/);
  });
});

describe('pageFileName', () => {
  it('maps routes to flat .html files', () => {
    expect(pageFileName('/')).toBe('index.html');
    expect(pageFileName('/getting-started')).toBe('getting-started.html');
  });
});

describe('renderSitemap', () => {
  it('lists every route with its canonical URL', () => {
    const sitemap = renderSitemap(PAGE_ROUTES, '2026-10-20');

    for (const route of PAGE_ROUTES) {
      expect(sitemap).toContain(`<loc>${canonicalUrl(route.path)}</loc>`);
    }
    expect(sitemap).toContain('<lastmod>2026-10-20</lastmod>');
  });
});

import { canonicalUrl, type PageRoute } from './routes';

/**
 * Build-time helpers for generating per-route HTML files and sitemap.xml.
 * Pure string functions so they can be unit tested against index.html.
 */

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function replaceOnce(html: string, pattern: RegExp, replacement: string, label: string): string {
  if (!pattern.test(html)) {
    throw new Error(`staticPages: could not find ${label} in index.html`);
  }
  // Function form so "$&" etc. in the replacement are inserted literally
  return html.replace(pattern, () => replacement);
}

function setMeta(html: string, attr: 'name' | 'property', key: string, content: string): string {
  const pattern = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`);
  return replaceOnce(html, pattern, `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`, `${attr}="${key}"`);
}

/**
 * Returns a copy of the built index.html with title, description, canonical,
 * Open Graph and Twitter tags set for the given route.
 */
export function renderPageHtml(indexHtml: string, route: PageRoute): string {
  const url = canonicalUrl(route.path);
  let html = indexHtml;

  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${escapeAttr(route.title)}</title>`, '<title>');
  html = replaceOnce(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`, 'canonical link');
  html = setMeta(html, 'name', 'description', route.description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'property', 'og:title', route.title);
  html = setMeta(html, 'property', 'og:description', route.description);
  html = setMeta(html, 'name', 'twitter:url', url);
  html = setMeta(html, 'name', 'twitter:title', route.title);
  html = setMeta(html, 'name', 'twitter:description', route.description);

  return html;
}

/**
 * Puts prerendered app markup inside the empty root div, tagged with the path it was
 * rendered for so main.tsx only hydrates when the URL matches.
 */
export function injectAppHtml(html: string, path: string, appHtml: string): string {
  return replaceOnce(
    html,
    /<div id="root"><\/div>/,
    `<div id="root" data-prerendered-path="${escapeAttr(path)}">${appHtml}</div>`,
    'root div'
  );
}

/**
 * Output filename for a route. GitHub Pages serves /faq from faq.html with a
 * 200, whereas faq/index.html would 301 to /faq/ and mismatch the canonical.
 */
export function pageFileName(path: string): string {
  return path === '/' ? 'index.html' : `${path.replace(/^\//, '')}.html`;
}

export function renderSitemap(routes: readonly PageRoute[], lastmod: string): string {
  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${canonicalUrl(route.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

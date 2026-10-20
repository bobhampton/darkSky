/**
 * Single source of truth for public page metadata.
 *
 * Used at runtime by usePageMetadata and at build time by the Vite plugin in
 * vite.config.ts, which writes a static HTML file per page (so each URL
 * returns HTTP 200 with its own head tags) and generates sitemap.xml.
 *
 * Keep this file free of browser and path-alias imports: it is also loaded
 * by Node when Vite reads its config.
 */

export const SITE_URL = 'https://darkskycalculator.com';

export interface PageRoute {
  path: string;
  title: string;
  description: string;
  changefreq: 'monthly' | 'yearly';
  priority: number;
}

export const PAGES = {
  home: {
    path: '/',
    title: 'darkSky Calculator - Dark Sky Times for Light Pollution Monitoring & Astronomy',
    description: 'Free dark sky calculator for light pollution monitoring, astronomy, and astrophotography. Calculate when the sun is 18° below the horizon (astronomical twilight) with no moon in the sky. Support citizen science initiatives for long-term night sky monitoring.',
    changefreq: 'monthly',
    priority: 1.0,
  },
  gettingStarted: {
    path: '/getting-started',
    title: 'Getting Started - darkSky Calculator',
    description: 'Learn how to use the darkSky calculator to find optimal dark sky observation times. Step-by-step guide for location input, date selection, understanding results, and exporting data for light pollution monitoring and astronomy.',
    changefreq: 'monthly',
    priority: 0.8,
  },
  faq: {
    path: '/faq',
    title: 'FAQ - darkSky Calculator',
    description: 'Frequently asked questions about the darkSky calculator. Learn about astronomical twilight, moon phases, light pollution monitoring, astrophotography planning, and how to use the calculator effectively.',
    changefreq: 'monthly',
    priority: 0.7,
  },
  partners: {
    path: '/partners',
    title: 'Partners & Resources - darkSky Calculator',
    description: 'Organizations and resources supporting dark sky preservation, including the Great Salt Lake Audubon chapter, plus guides to astronomical twilight and polar night.',
    changefreq: 'monthly',
    priority: 0.5,
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy Policy - darkSky Calculator',
    description: 'darkSky Calculator privacy policy. Learn about our data collection practices, use of Google Analytics, local storage, and your privacy rights. We do not collect personally identifiable information.',
    changefreq: 'yearly',
    priority: 0.3,
  },
} as const satisfies Record<string, PageRoute>;

export const PAGE_ROUTES: readonly PageRoute[] = Object.values(PAGES);

/** Absolute URL for a route path, without a trailing slash (except the root) */
export function canonicalUrl(path: string): string {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

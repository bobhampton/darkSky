import { useEffect } from 'react';
import { canonicalUrl } from '@/seo/routes';

interface PageMetadata {
  title: string;
  description?: string;
  path?: string;
}

/**
 * Custom hook to set page-specific SEO metadata (title, meta description, canonical URL)
 *
 * @param metadata - Object containing page title, optional description and optional route path
 *
 * @example
 * usePageMetadata(PAGES.gettingStarted);
 */
export function usePageMetadata({ title, description, path }: PageMetadata): void {
  useEffect(() => {
    // Set page title
    const previousTitle = document.title;
    document.title = title;

    // Set meta description if provided
    let previousDescription = '';
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        previousDescription = metaDescription.getAttribute('content') || '';
        metaDescription.setAttribute('content', description);
      }
    }

    // Set canonical and og:url if a route path is provided
    const canonical = document.querySelector('link[rel="canonical"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const previousCanonical = canonical?.getAttribute('href') || '';
    const previousOgUrl = ogUrl?.getAttribute('content') || '';
    if (path) {
      const url = canonicalUrl(path);
      canonical?.setAttribute('href', url);
      ogUrl?.setAttribute('content', url);
    }

    // Cleanup: restore original title, description and canonical on unmount
    return () => {
      document.title = previousTitle;
      if (description) {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && previousDescription) {
          metaDescription.setAttribute('content', previousDescription);
        }
      }
      if (path) {
        if (previousCanonical) canonical?.setAttribute('href', previousCanonical);
        if (previousOgUrl) ogUrl?.setAttribute('content', previousOgUrl);
      }
    };
  }, [title, description, path]);
}

import { useEffect } from 'react';

interface PageMetadata {
  title: string;
  description?: string;
}

/**
 * Custom hook to set page-specific SEO metadata (title and meta description)
 * 
 * @param metadata - Object containing page title and optional description
 * 
 * @example
 * usePageMetadata({
 *   title: 'Getting Started - darkSky Calculator',
 *   description: 'Learn how to use the darkSky calculator...'
 * });
 */
export function usePageMetadata({ title, description }: PageMetadata): void {
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

    // Cleanup: restore original title and description on unmount
    return () => {
      document.title = previousTitle;
      if (description) {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && previousDescription) {
          metaDescription.setAttribute('content', previousDescription);
        }
      }
    };
  }, [title, description]);
}

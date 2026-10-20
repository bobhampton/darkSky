/**
 * Web Vitals reporting utility
 * Measures and reports Core Web Vitals to Google Analytics using Google's web-vitals library
 *
 * Core Web Vitals measured:
 * - LCP (Largest Contentful Paint): < 2.5s (good), < 4s (needs improvement), >= 4s (poor)
 * - INP (Interaction to Next Paint): < 200ms (good), < 500ms (needs improvement), >= 500ms (poor)
 * - CLS (Cumulative Layout Shift): < 0.1 (good), < 0.25 (needs improvement), >= 0.25 (poor)
 *
 * Additional metrics:
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 *
 * Metrics a browser can't measure are not reported (e.g. Safari has no CLS or INP),
 * so event counts per metric vary by browser.
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

function sendToGoogleAnalytics({ name, value, delta, rating, id, navigationType }: Metric) {
  // Check if gtag is available (Google Analytics loaded)
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, {
      // Use delta so values sum correctly if a metric is reported more than once per page.
      // CLS is unitless and small, so scale it to keep precision as an integer.
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      metric_id: id,
      metric_value: value,
      metric_delta: delta,
      metric_rating: rating,
      metric_navigation_type: navigationType,
    });
  }
}

/**
 * Initialize Web Vitals reporting (production only)
 */
export function initWebVitals() {
  if (import.meta.env.DEV) {
    return;
  }

  onCLS(sendToGoogleAnalytics);
  onINP(sendToGoogleAnalytics);
  onLCP(sendToGoogleAnalytics);
  onFCP(sendToGoogleAnalytics);
  onTTFB(sendToGoogleAnalytics);
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

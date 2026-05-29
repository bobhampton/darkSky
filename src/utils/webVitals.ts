/**
 * Web Vitals reporting utility
 * Measures and reports Core Web Vitals to Google Analytics
 * 
 * Core Web Vitals measured:
 * - LCP (Largest Contentful Paint): < 2.5s (good), < 4s (needs improvement), >= 4s (poor)
 * - FID (First Input Delay): < 100ms (good), < 300ms (needs improvement), >= 300ms (poor)
 * - CLS (Cumulative Layout Shift): < 0.1 (good), < 0.25 (needs improvement), >= 0.25 (poor)
 * 
 * Additional metrics:
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * - INP (Interaction to Next Paint) - replaces FID in future
 */

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Check if gtag is available (Google Analytics loaded)
function sendToGoogleAnalytics(metric: Metric) {
  // Check if gtag is available
  if (typeof window !== 'undefined' && 'gtag' in window && typeof window.gtag === 'function') {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: metric.rating,
    });
  }
}

/**
 * Initialize Web Vitals reporting
 * Dynamically imports web-vitals library only when needed
 */
export async function initWebVitals() {
  // Only run in production
  if (import.meta.env.DEV) {
    return;
  }

  try {
    // Dynamically import web-vitals to avoid bundling in dev
    // Note: You'll need to install web-vitals: npm install web-vitals
    // For now, we'll use the Performance Observer API directly
    
    // Observe LCP (Largest Contentful Paint)
    observeLCP();
    
    // Observe FID (First Input Delay) 
    observeFID();
    
    // Observe CLS (Cumulative Layout Shift)
    observeCLS();
    
    // Observe FCP (First Contentful Paint)
    observeFCP();
    
  } catch (error) {
    console.error('Error initializing Web Vitals:', error);
  }
}

// LCP Observer
function observeLCP() {
  if (!('PerformanceObserver' in window)) return;
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
    const value = lastEntry.renderTime || lastEntry.loadTime || 0;
    
    sendToGoogleAnalytics({
      name: 'LCP',
      value,
      rating: value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor',
      delta: value,
      id: `lcp-${Date.now()}`,
    });
  });
  
  try {
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    // Browser doesn't support this metric
  }
}

// FID Observer
function observeFID() {
  if (!('PerformanceObserver' in window)) return;
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      const fidEntry = entry as PerformanceEntry & { processingStart?: number };
      const value = fidEntry.processingStart ? fidEntry.processingStart - entry.startTime : 0;
      
      sendToGoogleAnalytics({
        name: 'FID',
        value,
        rating: value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor',
        delta: value,
        id: `fid-${Date.now()}`,
      });
    });
  });
  
  try {
    observer.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    // Browser doesn't support this metric
  }
}

// CLS Observer
function observeCLS() {
  if (!('PerformanceObserver' in window)) return;
  
  let clsValue = 0;
  let sessionValue = 0;
  let sessionEntries: PerformanceEntry[] = [];
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    
    entries.forEach((entry) => {
      const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
      // Only count layout shifts without recent user input
      if (!layoutShift.hadRecentInput) {
        const value = layoutShift.value || 0;
        sessionValue += value;
        clsValue += value;
        sessionEntries.push(entry);
      }
    });
  });
  
  try {
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    // Browser doesn't support this metric
  }
  
  // Report CLS when the page is hidden or unloaded
  const reportCLS = () => {
    sendToGoogleAnalytics({
      name: 'CLS',
      value: clsValue,
      rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
      delta: clsValue,
      id: `cls-${Date.now()}`,
    });
  };
  
  // Report on page hide
  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      reportCLS();
    }
  });
  
  // Report on page unload
  addEventListener('pagehide', reportCLS);
}

// FCP Observer
function observeFCP() {
  if (!('PerformanceObserver' in window)) return;
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
    
    if (fcpEntry) {
      const value = fcpEntry.startTime;
      sendToGoogleAnalytics({
        name: 'FCP',
        value,
        rating: value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor',
        delta: value,
        id: `fcp-${Date.now()}`,
      });
    }
  });
  
  try {
    observer.observe({ type: 'paint', buffered: true });
  } catch (e) {
    // Browser doesn't support this metric
  }
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

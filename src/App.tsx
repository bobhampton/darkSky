import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar, Footer, ScrollToTop, ScrollToTopOnNav, ErrorBoundaryWrapper, Starfield, SkipToContent, LoadingSpinner } from '@/components';
import { HomePage } from '@/pages';
import { ObserverProvider } from '@/context';

// Lazy load non-critical pages for better initial load performance
const FAQPage = lazy(() => import('@/pages/FAQPage').then(m => ({ default: m.FAQPage })));
const GettingStartedPage = lazy(() => import('@/pages/GettingStartedPage').then(m => ({ default: m.GettingStartedPage })));
const PartnersPage = lazy(() => import('@/pages/PartnersPage').then(m => ({ default: m.PartnersPage })));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const ErrorPage = lazy(() => import('@/pages/ErrorPage').then(m => ({ default: m.ErrorPage })));
const NotFoundRedirect = lazy(() => import('@/pages/NotFoundRedirect').then(m => ({ default: m.NotFoundRedirect })));

/**
 * Main App component with routing configuration
 * Uses lazy loading for non-critical routes to improve initial load time
 *
 * The router is supplied by the caller: BrowserRouter in main.tsx,
 * StaticRouter in entry-server.tsx when prerendering at build time.
 */
function App() {
  return (
    <ObserverProvider>
      <ErrorBoundaryWrapper>
        <SkipToContent />
        <ScrollToTopOnNav />
        {/* Animated starfield background */}
        <Starfield />
        
        <div className="min-h-screen text-star-white flex flex-col relative">
          {/* Navigation - appears on all pages */}
          <Navbar />

          {/* Page Routes */}
          <main id="main-content" className="flex-grow" role="main">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
              </div>
            }>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/getting-started" element={<GettingStartedPage />} />
                <Route path="/partners" element={<PartnersPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/error" element={<ErrorPage />} />
                {/* Catch-all route for 404 errors */}
                <Route path="*" element={<NotFoundRedirect />} />
              </Routes>
            </Suspense>
          </main>

          {/* Footer - appears on all pages */}
          <Footer />

          {/* Scroll to Top Button - appears on all pages */}
          <ScrollToTop />
        </div>
      </ErrorBoundaryWrapper>
    </ObserverProvider>
  );
}

export default App;


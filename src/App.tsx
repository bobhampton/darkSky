import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar, Footer, ScrollToTop, ScrollToTopOnNav, ErrorBoundaryWrapper, Starfield } from '@/components';
import { HomePage, GettingStartedPage, PartnersPage, ErrorPage, NotFoundRedirect } from '@/pages';

/**
 * Main App component with routing configuration
 */
function App() {
  return (
    <BrowserRouter basename="/darkSky">
      <ErrorBoundaryWrapper>
        <ScrollToTopOnNav />
        {/* Animated starfield background */}
        <Starfield />
        
        <div className="min-h-screen text-star-white flex flex-col relative">
          {/* Navigation - appears on all pages */}
          <Navbar />

          {/* Page Routes */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/getting-started" element={<GettingStartedPage />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/error" element={<ErrorPage />} />
              {/* Catch-all route for 404 errors */}
              <Route path="*" element={<NotFoundRedirect />} />
            </Routes>
          </main>

          {/* Footer - appears on all pages */}
          <Footer />

          {/* Scroll to Top Button - appears on all pages */}
          <ScrollToTop />
        </div>
      </ErrorBoundaryWrapper>
    </BrowserRouter>
  );
}

export default App;


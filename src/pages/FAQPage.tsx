import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { usePageMetadata } from '@/hooks';
import { FAQSection, Breadcrumbs } from '@/components';

/**
 * FAQ Page - Frequently Asked Questions about darkSky Calculator
 */
export function FAQPage() {
  usePageMetadata({
    title: 'FAQ - darkSky Calculator',
    description: 'Frequently asked questions about the darkSky calculator. Learn about astronomical twilight, moon phases, light pollution monitoring, astrophotography planning, and how to use the calculator effectively.',
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Breadcrumbs />
      
      {/* Page Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-3">Frequently Asked Questions</h1>
        <p className="text-gray-400 text-lg">
          Find answers to common questions about using the darkSky calculator for astronomy,
          astrophotography, and light pollution monitoring.
        </p>
      </header>

      {/* FAQ Section Component */}
      <FAQSection />

      {/* Additional Help Resources */}
      <div className="mt-12 bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-white mb-4">Need More Help?</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/getting-started"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            View Getting Started Guide
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            Return to Calculator
          </Link>
        </div>
      </div>
    </div>
  );
}

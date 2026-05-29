import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useEffect } from 'react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

// Map routes to readable labels
const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/getting-started': 'Getting Started',
  '/faq': 'FAQ',
  '/partners': 'Partners & Resources',
  '/privacy': 'Privacy Policy',
};

/**
 * Breadcrumb navigation component with Schema.org structured data
 * Automatically generates breadcrumbs based on current route
 */
export function Breadcrumbs() {
  const location = useLocation();

  // Don't show breadcrumbs on homepage
  if (location.pathname === '/') {
    return null;
  }

  // Build breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
  ];

  const currentPath = location.pathname;
  const currentLabel = routeLabels[currentPath];

  // Only show breadcrumb if we have a label for this route
  if (currentLabel && currentPath !== '/') {
    breadcrumbs.push({ label: currentLabel, path: currentPath });
  }

  useEffect(() => {
    // Add BreadcrumbList structured data to the page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'breadcrumb-schema';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.label,
        item: `https://darkskycalculator.com${crumb.path}`,
      })),
    });
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('breadcrumb-schema');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [location.pathname, breadcrumbs]);

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-gray-400">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isHome = crumb.path === '/';

          return (
            <li key={crumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-2 text-gray-500" aria-hidden="true" />
              )}
              {isLast ? (
                <span className="text-gray-300 font-medium flex items-center gap-1.5" aria-current="page">
                  {isHome && <Home className="w-4 h-4" aria-hidden="true" />}
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
                >
                  {isHome && <Home className="w-4 h-4" aria-hidden="true" />}
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

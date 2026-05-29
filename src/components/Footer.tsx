import { Link } from 'react-router-dom';

/**
 * Application footer component
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-12" role="contentinfo">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-400">

          {/* Left — Links */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <a
              href="https://github.com/bobhampton/darkSky"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
              aria-label="View source code on GitHub (opens in new tab)"
            >
              Source Code
            </a>
            <Link
              to="/faq"
              className="text-blue-400 hover:text-blue-300 transition-colors underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            >
              FAQ
            </Link>
            <Link
              to="/privacy"
              className="text-blue-400 hover:text-blue-300 transition-colors underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            >
              Privacy Policy
            </Link>
            <a
              href="https://doi.org/10.5281/zenodo.14847871"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
              aria-label="View DOI citation (opens in new tab)"
            >
              Cite This Work
            </a>
          </div>

          {/* Center — Contact */}
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-gray-300 font-medium">Found a bug or have feedback?</p>
            <div className="flex flex-col items-center gap-3">
              <p className="text-gray-200">
                Email: <a 
                  href="mailto:darkskycalculator@gmail.com"
                  className="text-blue-400 hover:text-blue-300 transition-colors underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                >
                  darkskycalculator@gmail.com
                </a>
              </p>
              <a
                href="https://github.com/bobhampton/darkSky/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Open a GitHub issue (opens in new tab)"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                Open an Issue
              </a>
            </div>
          </div>

          {/* Right — Attribution & Copyright */}
          <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
            <p>
              Powered by{' '}
              <a
                href="https://github.com/cosinekitty/astronomy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                aria-label="Learn about Astronomy Engine (opens in new tab)"
              >
                Astronomy Engine
              </a>
            </p>
            <p aria-hidden="true">&nbsp;</p>
            <p aria-hidden="true">&nbsp;</p>
            <p>&copy; {currentYear} darkSky Project. MIT License.</p>
          </div>

        </div>
      </div>
    </footer>
  );
}

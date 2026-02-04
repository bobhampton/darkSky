/**
 * Application footer component
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-400 text-sm space-y-3">
          {/* Source code reference */}
          <p>
            All source code and documentation is available{' '}
            <a
              href="https://github.com/bobhampton/darkSky"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              here
            </a>
            , or you can use your browser's "View Source" command to inspect this page.
          </p>

          {/* Astronomy Engine attribution */}
          <p>
            This page uses{' '}
            <a
              href="https://github.com/cosinekitty/astronomy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              Astronomy Engine
            </a>
            {' '}to generate these times.
          </p>

          {/* DOI Citation */}
          <p>
            Cite this work:{' '}
            <a
              href="https://doi.org/10.5281/zenodo.14847872"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              https://doi.org/10.5281/zenodo.14847872
            </a>
          </p>

          {/* Copyright & License */}
          <p className="pt-2">
            &copy; {currentYear} darkSky Project. Licensed under the MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}

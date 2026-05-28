/**
 * Skip to content link for keyboard and screen reader users
 * Becomes visible on focus, allows users to skip navigation
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
    >
      Skip to main content
    </a>
  );
}

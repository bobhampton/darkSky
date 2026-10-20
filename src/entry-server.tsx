import { StrictMode } from 'react';
import { prerender } from 'react-dom/static';
import { StaticRouter } from 'react-router-dom';
import App from './App';

/**
 * Renders a route to HTML at build time (called from vite.config.ts).
 * prerender waits for lazy-loaded pages, so the output contains the full page content.
 */
export async function render(path: string): Promise<string> {
  const errors: unknown[] = [];
  const { prelude } = await prerender(
    <StrictMode>
      <StaticRouter location={path} basename={import.meta.env.BASE_URL}>
        <App />
      </StaticRouter>
    </StrictMode>,
    {
      // Keep Suspense content inline. By default React moves large boundaries into a hidden
      // div that a script swaps in, leaving the loading spinner where the content belongs.
      progressiveChunkSize: Number.POSITIVE_INFINITY,
      onError(error) {
        errors.push(error);
      },
    }
  );

  // React would otherwise fall back to client rendering silently; fail the build instead
  if (errors.length > 0) {
    throw errors[0];
  }

  return new Response(prelude).text();
}

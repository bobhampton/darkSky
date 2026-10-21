import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * Returns false while prerendering and during hydration, then true once running in the browser.
 * Use it to keep browser-only UI (like the Leaflet map) out of the build-time HTML
 * without causing a hydration mismatch.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

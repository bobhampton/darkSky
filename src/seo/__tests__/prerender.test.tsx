import { describe, it, expect, vi, afterEach } from 'vitest';
import { StrictMode, act } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { prerender } from 'react-dom/static';
import { BrowserRouter } from 'react-router-dom';
import { render } from '../../entry-server';
import App from '../../App';
import { PAGE_ROUTES } from '../routes';

const BUILD_TIME = new Date('2026-01-01T12:00:00Z');
const VISIT_TIME = new Date('2026-03-15T12:00:00Z');

/**
 * Server-renders a route the way the build does. React's server renderer leaves the last
 * context values (e.g. the router location) set until its next render, which the client
 * renderer would see in this shared process; an empty render resets them.
 */
async function renderForBuild(path: string): Promise<string> {
  const html = await render(path);
  await prerender(<></>);
  return html;
}

// React attaches its fiber to DOM nodes once they're hydrated
const isHydrated = (node: Element) => Object.keys(node).some((key) => key.startsWith('__reactFiber'));

// Browser APIs jsdom lacks; the app only needs them to exist on mount
class StubWorker {
  onmessage = null;
  onerror = null;
  postMessage() {}
  terminate() {}
  addEventListener() {}
  removeEventListener() {}
}

class StubIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

let root: Root | undefined;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  document.body.innerHTML = '';
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe.each(PAGE_ROUTES)('prerendered $path', (route) => {
  it('contains the page content without loading fallbacks', async () => {
    const html = await renderForBuild(route.path);

    expect(html).toMatch(/<h1[^>]*>/);
    expect(html).not.toContain('Calculating dark times');
    expect(html).not.toContain('<template');
  });

  it('hydrates without mismatches when visited on a later date', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(BUILD_TIME);
    const html = await renderForBuild(route.path);

    vi.setSystemTime(VISIT_TIME);
    vi.stubGlobal('Worker', StubWorker);
    vi.stubGlobal('IntersectionObserver', StubIntersectionObserver);
    window.history.replaceState(null, '', route.path);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const consoleError = vi.spyOn(console, 'error');
    const errors: unknown[] = [];
    const collect = (error: unknown) => errors.push(error);

    await act(async () => {
      root = hydrateRoot(
        container,
        <StrictMode>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </StrictMode>,
        { onRecoverableError: collect, onCaughtError: collect, onUncaughtError: collect }
      );
    });
    await vi.waitFor(() => expect(isHydrated(container.querySelector('h1')!)).toBe(true));

    const hydrationWarnings = consoleError.mock.calls.filter((args) => /hydrat/i.test(String(args[0])));
    expect(errors).toEqual([]);
    expect(hydrationWarnings).toEqual([]);

    if (route.path === '/') {
      // Default dates come from the visitor's clock, not the build's
      expect(container.querySelector<HTMLInputElement>('#dateStart')!.value).toBe('2026-03-15');
    }
  });
});

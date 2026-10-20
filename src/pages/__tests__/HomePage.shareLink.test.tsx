import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../HomePage';
import { ObserverProvider } from '@/context/ObserverContext';
import type { WorkerCalculateMessage } from '@/types';

// Captures calculation requests instead of running the astronomy worker
const postMessage = vi.fn<(message: WorkerCalculateMessage) => void>();
class StubWorker {
  onmessage = null;
  onerror = null;
  postMessage = postMessage;
  terminate() {}
}

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <ObserverProvider>
        <HomePage />
      </ObserverProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.stubGlobal('Worker', StubWorker);
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
  window.scrollTo = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
  postMessage.mockReset();
});

describe('HomePage shared links', () => {
  test('fills in the form and calculates from a shared link', async () => {
    renderAt('/?lat=40.76078&lon=-111.89105&elev=1288&tz=America%2FDenver&start=2026-10-20&end=2026-10-27&name=Salt+Lake+City');

    await waitFor(() => expect(postMessage).toHaveBeenCalledTimes(1));
    expect(postMessage.mock.calls[0][0].params).toEqual({
      latitude: 40.76078,
      longitude: -111.89105,
      elevation: 1288,
      timezone: 'America/Denver',
      dateStart: '2026-10-20',
      dateEnd: '2026-10-27',
    });
    expect(screen.getByLabelText(/start date/i)).toHaveValue('2026-10-20');
    expect(screen.getByLabelText(/elevation/i)).toHaveValue(1288);
  });

  test('looks up the timezone and uses default dates when the link omits them', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ timeZone: 'America/Denver' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    renderAt('/?lat=40.76&lon=-111.89');

    await waitFor(() => expect(postMessage).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0][0]).toContain('latitude=40.76&longitude=-111.89');
    expect(postMessage.mock.calls[0][0].params).toMatchObject({
      timezone: 'America/Denver',
      elevation: 0,
    });
    expect(postMessage.mock.calls[0][0].params.dateStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('ignores URLs without share parameters', async () => {
    renderAt('/?utm_source=newsletter');

    await waitFor(() => expect(screen.getByLabelText(/start date/i)).not.toHaveValue(''));
    expect(postMessage).not.toHaveBeenCalled();
  });
});

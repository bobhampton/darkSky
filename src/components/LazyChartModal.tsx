import { lazy, Suspense } from 'react';
import type { ChartModalProps } from '@/types';
import { LoadingSpinner } from './LoadingSpinner';

// Lazy load ChartModal and Chart.js dependencies only when user opens a chart
const ChartModal = lazy(() => import('./ChartModal').then(m => ({ default: m.ChartModal })));

/**
 * Lazy-loaded wrapper for ChartModal
 * Loads Chart.js (172 KB) only when user opens a chart, improving initial bundle size
 */
export function LazyChartModal(props: ChartModalProps) {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8">
            <LoadingSpinner />
            <p className="text-white mt-4">Loading chart...</p>
          </div>
        </div>
      }
    >
      <ChartModal {...props} />
    </Suspense>
  );
}

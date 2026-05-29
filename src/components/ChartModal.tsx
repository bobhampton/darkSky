import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ChartModalProps } from '@/types';
import { useChartData } from '@/hooks/useChartData';
import { createChartOptions, createDarkSkyPlugin, createChartJSData } from '@/utils/chartConfig';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

/**
 * Modal displaying altitude charts for Sun and Moon
 */
export function ChartModal({ date, observerConfig, onClose }: ChartModalProps) {
  const { chartData, isLoading } = useChartData(date, observerConfig);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  const chartOptions = createChartOptions(date, observerConfig);
  const chartPlugins = chartData ? [createDarkSkyPlugin(chartData)] : [];
  const chartJSData = chartData ? createChartJSData(chartData) : null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chart-modal-title"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 id="chart-modal-title" className="text-2xl font-bold text-white">
            Altitude Chart - {date}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded"
            aria-label="Close altitude chart modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-white">Generating chart...</div>
            </div>
          ) : chartJSData ? (
            <div className="h-96">
              <Line options={chartOptions} data={chartJSData} plugins={chartPlugins} />
            </div>
          ) : (
            <div className="text-center text-gray-400 h-96 flex items-center justify-center">
              Failed to generate chart data
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-6 pb-6 text-sm text-gray-400">
          <p>
            <strong>Dark periods</strong> occur when the Sun is below -18° (astronomical twilight) and the Moon is
            below the horizon.
          </p>
          <p className="mt-2">
            Time zone: <span className="text-white">{observerConfig.timezone}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

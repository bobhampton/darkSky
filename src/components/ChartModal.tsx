import { useEffect, useRef, useState } from 'react';
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
  type ChartOptions,
  type Plugin,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ChartModalProps, AltitudeChartData } from '@/types';
import { calculateAltitude } from '@/utils/astronomy';
import { DateTime } from 'luxon';
import * as Astronomy from 'astronomy-engine';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Modal displaying altitude charts for Sun and Moon
 */
export function ChartModal({ date, observerConfig, onClose }: ChartModalProps) {
  const [chartData, setChartData] = useState<AltitudeChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateChartData();
  }, [date, observerConfig]);

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

  const generateChartData = () => {
    setIsLoading(true);
    try {
      // Parse date and generate 24 hours of data points
      const startDate = DateTime.fromISO(date, { zone: observerConfig.timezone });
      const dataPoints: AltitudeChartData = {
        labels: [],
        sunAltitudes: [],
        moonAltitudes: [],
        darkPeriods: [],
      };

      const observer = new Astronomy.Observer(
        observerConfig.latitude,
        observerConfig.longitude,
        observerConfig.elevation
      );

      // Generate altitude data for every 1 minute (matches original)
      let darkBlock: { start: string; end: string } | null = null;
      
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 1) {
          const currentTime = startDate.set({ hour, minute, second: 0, millisecond: 0 });
          const timeLabel = currentTime.toFormat('HH:mm');

          const sunAlt = calculateAltitude('Sun', observer, currentTime.toJSDate());
          const moonAlt = calculateAltitude('Moon', observer, currentTime.toJSDate());

          dataPoints.labels.push(timeLabel);
          dataPoints.sunAltitudes.push(sunAlt);
          dataPoints.moonAltitudes.push(moonAlt);

          // Track dark periods (sun <= -18 degrees AND moon < 0)
          if (moonAlt < 0 && sunAlt <= -18) {
            if (!darkBlock) {
              darkBlock = { start: timeLabel, end: timeLabel };
            }
            darkBlock.end = timeLabel;
          } else if (darkBlock) {
            dataPoints.darkPeriods.push({ ...darkBlock });
            darkBlock = null;
          }
        }
      }

      // Capture any remaining dark block
      if (darkBlock) {
        dataPoints.darkPeriods.push({ ...darkBlock });
      }

      setChartData(dataPoints);
    } catch (error) {
      console.error('Error generating chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e5e7eb',
        },
      },
      title: {
        display: true,
        text: `${date} Dark Sky Times (Lat: ${observerConfig.latitude}, Lon: ${observerConfig.longitude})`,
        color: '#e5e7eb',
        font: {
          size: 16,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed.y;
            return value !== null ? `${ctx.dataset.label}: ${value.toFixed(2)}°` : '';
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
          color: '#9ca3af',
        },
        ticks: {
          color: '#9ca3af',
          maxTicksLimit: 24,
          autoSkip: true,
        },
        grid: {
          color: '#374151',
        },
        offset: true,
      },
      y: {
        title: {
          display: true,
          text: 'Altitude (°)',
          color: '#9ca3af',
        },
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: '#374151',
        },
        suggestedMin: -90,
        suggestedMax: 90,
      },
    },
  };

  // Custom Chart.js plugin to draw dark sky windows
  const chartPlugins: Plugin<'line'>[] = [
    {
      id: 'darkSkyOverlay',
      beforeDraw: (chart) => {
        if (!chartData) return;

        const { ctx, chartArea, scales } = chart;
        const { top, bottom, left, right } = chartArea;
        const xScale = scales.x;
        const yScale = scales.y;

        // Colors matching original implementation
        const darkSkyColor = 'rgba(29, 29, 62, 0.35)';
        const darkBorderColor = 'rgba(47, 255, 0, 0.6)';
        const horizonColor = 'rgba(255, 255, 255, 0.9)';
        const twilightColor = 'rgba(255, 128, 0, 0.69)';

        // Draw reference lines
        const drawLine = (yVal: number, color: string, dash: number[] = [4, 4], width: number = 2) => {
          const y = yScale.getPixelForValue(yVal);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, y);
          ctx.lineTo(right, y);
          ctx.strokeStyle = color;
          ctx.lineWidth = width;
          ctx.setLineDash(dash);
          ctx.stroke();
          ctx.restore();
        };

        // Draw horizon line (solid, thicker, white)
        drawLine(0, horizonColor, [0, 0], 3);
        // Draw astronomical twilight line (dashed)
        drawLine(-18, twilightColor, [2, 6]);

        // Draw shaded dark sky periods (only if they exist)
        if (chartData.darkPeriods && chartData.darkPeriods.length > 0) {
          chartData.darkPeriods.forEach((period) => {
            const startIndex = chartData.labels.indexOf(period.start);
            const endIndex = chartData.labels.indexOf(period.end);
            
            if (startIndex === -1 || endIndex === -1) return;
            
            const xMin = xScale.getPixelForValue(startIndex);
            const xMax = xScale.getPixelForValue(endIndex);

            // Fill shaded rectangle
            ctx.save();
            ctx.fillStyle = darkSkyColor;
            ctx.fillRect(xMin, top, xMax - xMin, bottom - top);

            // Add green border (solid)
            ctx.strokeStyle = darkBorderColor;
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            ctx.strokeRect(xMin, top, xMax - xMin, bottom - top);
            ctx.restore();
          });
        }
      },
    },
  ];

  const getChartJSData = () => {
    if (!chartData) return null;

    return {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Sun Alt. (°)',
          data: chartData.sunAltitudes,
          borderColor: 'rgba(255, 68, 0, 0.8)',
          backgroundColor: 'rgba(255, 68, 0, 0.8)',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Moon Alt. (°)',
          data: chartData.moonAltitudes,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
      ],
    };
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Altitude Chart</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-white">Generating chart...</div>
            </div>
          ) : chartData && getChartJSData() ? (
            <div className="h-96">
              <Line options={chartOptions} data={getChartJSData()!} plugins={chartPlugins} />
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
            <strong>Dark periods</strong> occur when the Sun is below -18° (astronomical twilight) 
            and the Moon is below the horizon.
          </p>
          <p className="mt-2">
            Time zone: <span className="text-white">{observerConfig.timezone}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

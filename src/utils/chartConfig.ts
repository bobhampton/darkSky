import type { ChartOptions, Plugin } from 'chart.js';
import {
  ASTRONOMICAL_TWILIGHT_THRESHOLD,
  HORIZON_THRESHOLD,
  MIN_ALTITUDE_DEGREES,
  MAX_ALTITUDE_DEGREES,
} from './constants';
import type { AltitudeChartData, ObserverConfig } from '@/types';

/**
 * Chart.js configuration for altitude charts
 */
export function createChartOptions(date: string, observerConfig: ObserverConfig): ChartOptions<'line'> {
  return {
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
        suggestedMin: MIN_ALTITUDE_DEGREES,
        suggestedMax: MAX_ALTITUDE_DEGREES,
      },
    },
  };
}

/**
 * Chart.js plugin to draw dark sky windows and reference lines
 */
export function createDarkSkyPlugin(chartData: AltitudeChartData): Plugin<'line'> {
  return {
    id: 'darkSkyOverlay',
    beforeDraw: (chart) => {
      if (!chartData) return;

      const { ctx, chartArea, scales } = chart;
      const { top, bottom, left, right } = chartArea;
      const xScale = scales.x;
      const yScale = scales.y;

      // Colors
      const darkSkyColor = 'rgba(29, 29, 62, 0.35)';
      const darkBorderColor = 'rgba(47, 255, 0, 0.6)';
      const horizonColor = 'rgba(255, 255, 255, 0.9)';
      const twilightColor = 'rgba(255, 128, 0, 0.69)';

      // Helper to draw reference lines
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
      drawLine(HORIZON_THRESHOLD, horizonColor, [0, 0], 3);
      // Draw astronomical twilight line (dashed)
      drawLine(ASTRONOMICAL_TWILIGHT_THRESHOLD, twilightColor, [2, 6]);

      // Draw shaded dark sky periods
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
  };
}

/**
 * Convert altitude chart data to Chart.js format
 */
export function createChartJSData(chartData: AltitudeChartData) {
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
}

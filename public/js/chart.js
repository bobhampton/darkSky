import { DateTime } from 'https://cdn.jsdelivr.net/npm/luxon@2.0.0/build/es6/luxon.js';
import { calculateAltitude } from './astronomy.js';

export function plotSunAltitudeChart(canvas, observer, date, zone) {
  const intervalMinutes = 1;
  const timestamps = [];
  const moonAltitudes = [];
  const sunAltitudes = [];

  const start = date.set({ hour: 0, minute: 0 });
  const end = date.set({ hour: 23, minute: 59 });

  let dt = start;
  while (dt <= end) {
    const jsDate = dt.toUTC().toJSDate();
    const timeStr = dt.toFormat('HH:mm');
    timestamps.push(timeStr);
    moonAltitudes.push(calculateAltitude('Moon', observer, jsDate));
    sunAltitudes.push(calculateAltitude('Sun', observer, jsDate));
    dt = dt.plus({ minutes: intervalMinutes });
  }

  // Ideal dark-sky periods: Moon < 0, Sun ≤ -18
  const trueDarkSkyPeriods = [];
  let darkBlock = null;

  for (let i = 0; i < timestamps.length; i++) {
    const moonAlt = moonAltitudes[i];
    const sunAlt = sunAltitudes[i];

    if (moonAlt < 0 && sunAlt <= -18) {
      if (!darkBlock) darkBlock = { start: timestamps[i] };
      darkBlock.end = timestamps[i];
    } else if (darkBlock) {
      trueDarkSkyPeriods.push({ ...darkBlock });
      darkBlock = null;
    }
  }

  if (darkBlock) trueDarkSkyPeriods.push({ ...darkBlock });

  const dayStr = date.toISODate();

  console.log(`True dark periods for ${dayStr}:`);
  trueDarkSkyPeriods.forEach((p, idx) => {
    console.log(`  ${idx + 1}. ${p.start} → ${p.end}`);
  });

  // Colors
  const sunColor = 'rgba(255, 68, 0, 0.8)';
  const moonColor = 'rgba(54, 162, 235, 1)';
  const darkSkyColor = 'rgba(29, 29, 62, 0.35)';
  const darkSkyBorderColor = 'rgba(47, 255, 0, 0.6)';
  const twilightColor = 'rgba(255, 128, 0, 0.69)';
  const twilightFadedColor = 'rgba(255, 128, 0, 0.34)'
  const horizonColor = 'rgba(0, 0, 0, 0.73)';

  return new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: timestamps,
      datasets: [
        {
          label: 'Horizon (0°)',
          backgroundColor: horizonColor,
          pointRadius: 0,
          showLine: true,
          spanGaps: true,
          fill: false
        },
        {
          label: 'Astro. Twilight (-18°)',
          backgroundColor: twilightFadedColor,
          //backgroundColor: 'white',
          pointRadius: 0,
          showLine: true,
          spanGaps: true,
          fill: false,
          borderDash: [2, 4],
          borderWidth: 2,
          borderColor: twilightColor
        },
        {
          label: 'Sun Alt. (°)',
          data: sunAltitudes,
          borderColor: sunColor,
          backgroundColor: sunColor,
          fill: false,
          borderWidth: 2,
          pointRadius: 0
        },
        {
          label: 'Moon Alt. (°)',
          data: moonAltitudes,
          borderColor: moonColor,
          backgroundColor: moonColor,
          fill: false,
          borderWidth: 2,
          pointRadius: 0
        },
        {
          label: 'Ideal Dark Sky Window (Sun < -18° & Moon < 0°)',
          data: trueDarkSkyPeriods,
          backgroundColor: darkSkyColor,
          borderColor: darkSkyBorderColor,
          pointRadius: 0,
          showLine: true,
          spanGaps: true,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      animation: false,
      scales: {
        x: {
          title: { display: true, text: 'Time' },
          ticks: {
            maxTicksLimit: 24,
            autoSkip: true
          },
          offset: true
        },
        y: {
          title: { display: true, text: 'Altitude (°)' },
          suggestedMin: -90,
          suggestedMax: 90
        }
      },
      plugins: {
        legend: { display: true },
        title: {
          display: true,
          text: `${date.toISODate()} Dark Sky Times (Lat: ${observer.latitude}, Lon: ${observer.longitude})`
        },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)}°`
          }
        }
      }
    },
    plugins: [{
      id: 'darkAndHorizonOverlay',
      beforeDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        const { top, bottom, left, right } = chartArea;
        const xScale = scales.x;
        const yScale = scales.y;

        // Draw horizontal reference lines
        const drawLine = (yVal, color, dash = [4, 4]) => {
          const y = yScale.getPixelForValue(yVal);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, y);
          ctx.lineTo(right, y);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.setLineDash(dash);
          ctx.stroke();
          ctx.restore();
        };

        drawLine(0, horizonColor, [0, 0]);        // Horizon line
        drawLine(-18, twilightColor, [2, 6]);     // Astronomical Twilight line

        // Draw shaded dark sky periods
        trueDarkSkyPeriods.forEach(period => {
          const xMin = xScale.getPixelForValue(period.start);
          const xMax = xScale.getPixelForValue(period.end);
          ctx.save();
          ctx.fillStyle = darkSkyColor;
          ctx.fillRect(xMin, top, xMax - xMin, bottom - top);

          // Add border to the shaded area
          ctx.strokeStyle = darkSkyBorderColor;
          ctx.lineWidth = 3;
          ctx.strokeRect(xMin, top, xMax - xMin, bottom - top);
          ctx.restore();
        });
      }
    }]
  });
}

// Make the chart fullscreen
export function showFullscreenChart(observer, date, zone) {
  const modal = document.getElementById('chartModal');
  const canvas = document.getElementById('fullscreenChartCanvas');

  modal.style.display = 'flex';

  // Clear previous chart if exists
  if (canvas._chartInstance) {
    canvas._chartInstance.destroy();
  }

  const chart = plotSunAltitudeChart(canvas, observer, date, zone);

  canvas._chartInstance = chart;
}
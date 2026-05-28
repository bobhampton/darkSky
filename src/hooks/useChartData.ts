import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import * as Astronomy from 'astronomy-engine';
import { calculateAltitude } from '@/utils/astronomy';
import {
  ASTRONOMICAL_TWILIGHT_THRESHOLD,
  HORIZON_THRESHOLD,
  HOURS_IN_DAY,
  MINUTES_IN_HOUR,
  CHART_SAMPLE_INTERVAL_MINUTES,
} from '@/utils/constants';
import type { AltitudeChartData, ObserverConfig } from '@/types';

/**
 * Custom hook to generate altitude chart data for Sun and Moon
 */
export function useChartData(date: string, observerConfig: ObserverConfig) {
  const [chartData, setChartData] = useState<AltitudeChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateChartData();
  }, [date, observerConfig]);

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

      // Generate altitude data for every minute (configurable interval)
      let darkBlock: { start: string; end: string } | null = null;

      for (let hour = 0; hour < HOURS_IN_DAY; hour++) {
        for (let minute = 0; minute < MINUTES_IN_HOUR; minute += CHART_SAMPLE_INTERVAL_MINUTES) {
          const currentTime = startDate.set({ hour, minute, second: 0, millisecond: 0 });
          const timeLabel = currentTime.toFormat('HH:mm');

          const sunAlt = calculateAltitude('Sun', observer, currentTime.toJSDate());
          const moonAlt = calculateAltitude('Moon', observer, currentTime.toJSDate());

          dataPoints.labels.push(timeLabel);
          dataPoints.sunAltitudes.push(sunAlt);
          dataPoints.moonAltitudes.push(moonAlt);

          // Track dark periods (sun at/below twilight threshold AND moon below horizon)
          if (moonAlt < HORIZON_THRESHOLD && sunAlt <= ASTRONOMICAL_TWILIGHT_THRESHOLD) {
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

  return { chartData, isLoading };
}

import type { ObserverConfig } from './astronomy.types';

/**
 * Data structure for altitude charts
 */
export interface AltitudeChartData {
  labels: string[];
  sunAltitudes: number[];
  moonAltitudes: number[];
  darkPeriods: DarkPeriod[];
}

/**
 * Time period where the sky is truly dark
 */
export interface DarkPeriod {
  /** Start time in HH:mm format */
  start: string;
  /** End time in HH:mm format */
  end: string;
}

/**
 * Props for ChartModal component
 */
export interface ChartModalProps {
  date: string;
  observerConfig: ObserverConfig;
  onClose: () => void;
}


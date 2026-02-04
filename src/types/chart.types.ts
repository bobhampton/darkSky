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

export interface AltitudeDataset {
  label: string;
  data: number[];
  borderColor: string;
  /** Fill color */
  backgroundColor: string;
  /** Whether to fill under the line */
  fill: boolean;
  /** Line width */
  borderWidth: number;
  /** Point radius (0 for no points) */
  pointRadius: number;
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

/**
 * Props for altitude chart component
 */
export interface AltitudeChartProps {
  data: AltitudeChartData;
  title: string;
}


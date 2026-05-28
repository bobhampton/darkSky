/**
 * Types for Web Worker communication
 */

import type { DarkTimesData, CalculationParams } from './astronomy.types';

/**
 * Message sent from main thread to worker to start calculation
 */
export interface WorkerCalculateMessage {
  type: 'calculate';
  params: CalculationParams;
}

/**
 * Message sent from worker to main thread with progress updates
 */
export interface WorkerProgressMessage {
  type: 'progress';
  current: number;
  total: number;
  currentDate: string;
}

/**
 * Message sent from worker to main thread when calculation completes
 */
export interface WorkerResultMessage {
  type: 'result';
  data: DarkTimesData;
}

/**
 * Message sent from worker to main thread when an error occurs
 */
export interface WorkerErrorMessage {
  type: 'error';
  error: string;
}

/**
 * Union type of all possible worker messages
 */
export type WorkerMessage =
  | WorkerProgressMessage
  | WorkerResultMessage
  | WorkerErrorMessage;

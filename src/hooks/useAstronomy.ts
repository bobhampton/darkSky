import { useState, useCallback, useEffect, useRef } from 'react';
import type { DarkTimesData, CalculationParams, WorkerCalculateMessage, WorkerMessage } from '@/types';

interface UseAstronomyReturn {
  darkTimesData: DarkTimesData | null;
  isCalculating: boolean;
  error: string | null;
  progress: { current: number; total: number; currentDate?: string } | null;
  calculateDarkTimes: (params: CalculationParams) => void;
  clearData: () => void;
}

/**
 * Custom hook for managing astronomical calculations using Web Workers
 * Handles dark sky time calculations with loading, progress, and error states
 * @returns Dark times data, loading state, progress, and calculation functions
 */
export function useAstronomy(): UseAstronomyReturn {
  const [darkTimesData, setDarkTimesData] = useState<DarkTimesData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number; currentDate?: string } | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Initialize worker on mount, cleanup on unmount
  useEffect(() => {
    // Create worker instance
    workerRef.current = new Worker(
      new URL('../workers/astronomy.worker.ts', import.meta.url),
      { type: 'module' }
    );

    // Set up message handler
    workerRef.current.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;

      switch (message.type) {
        case 'progress':
          setProgress({
            current: message.current,
            total: message.total,
            currentDate: message.currentDate,
          });
          break;

        case 'result':
          setDarkTimesData(message.data);
          setIsCalculating(false);
          setProgress(null);
          break;

        case 'error':
          setError(message.error);
          setIsCalculating(false);
          setProgress(null);
          console.error('Worker calculation error:', message.error);
          break;
      }
    };

    // Set up error handler
    workerRef.current.onerror = (error) => {
      setError('Calculation failed: ' + error.message);
      setIsCalculating(false);
      setProgress(null);
      console.error('Worker error:', error);
    };

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const calculateDarkTimes = useCallback((params: CalculationParams) => {
    if (!workerRef.current) {
      setError('Worker not initialized');
      return;
    }

    setIsCalculating(true);
    setError(null);
    setProgress(null);
    setDarkTimesData(null);

    // Send calculation request to worker
    const message: WorkerCalculateMessage = {
      type: 'calculate',
      params,
    };
    workerRef.current.postMessage(message);
  }, []);

  const clearData = useCallback(() => {
    setDarkTimesData(null);
    setError(null);
    setProgress(null);
  }, []);

  return {
    darkTimesData,
    isCalculating,
    error,
    progress,
    calculateDarkTimes,
    clearData,
  };
}

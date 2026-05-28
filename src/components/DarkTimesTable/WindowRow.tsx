import { DEFAULT_TIMEZONE } from '@/utils/timezones';
import type { DarkTimeWindow } from '@/types';

interface WindowRowProps {
  window: DarkTimeWindow;
  timezone: string;
}

/**
 * Display a single dark time window
 */
export function WindowRow({ window, timezone }: WindowRowProps) {
  // Simple date formatter
  const formatTime = (date: Date) => {
    try {
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      // Fallback to UTC if timezone formatting fails
      console.warn(`Timezone formatting error, falling back to ${DEFAULT_TIMEZONE}:`, error);
      return date.toLocaleString('en-US', {
        timeZone: DEFAULT_TIMEZONE,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  return (
    <div className="text-xs space-y-1 bg-gray-700/50 p-2 rounded border border-green-500/30">
      <div>
        <span className="text-gray-400">Start:</span>{' '}
        <span className="text-white">{formatTime(window.start)}</span>
      </div>
      <div>
        <span className="text-gray-400">End:</span>{' '}
        <span className="text-white">{formatTime(window.end)}</span>
      </div>
    </div>
  );
}

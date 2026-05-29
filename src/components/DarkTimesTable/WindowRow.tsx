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
  // Simple time formatter (no date)
  const formatTime = (date: Date) => {
    try {
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      // Fallback to UTC if timezone formatting fails
      console.warn(`Timezone formatting error, falling back to ${DEFAULT_TIMEZONE}:`, error);
      return date.toLocaleString('en-US', {
        timeZone: DEFAULT_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  // Type badge configuration
  const typeConfig: Record<string, { color: string; label: string; borderColor: string }> = {
    dawn: { color: 'bg-blue-600', label: 'Dawn', borderColor: 'border-blue-500/30' },
    dusk: { color: 'bg-orange-600', label: 'Dusk', borderColor: 'border-orange-500/30' },
    polarNight: { color: 'bg-purple-600', label: 'Polar Night', borderColor: 'border-purple-500/30' },
  };

  const config = typeConfig[window.type] || { color: 'bg-gray-600', label: window.type, borderColor: 'border-green-500/30' };

  return (
    <div className={`w-fit flex text-xs bg-gray-700/50 rounded border ${config.borderColor} overflow-hidden`}>
      {/* Vertical stripe with rotated text */}
      <div className={`${config.color} flex items-center justify-center w-6 flex-shrink-0`}>
        <span className="text-white text-[10px] font-medium whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          {config.label}
        </span>
      </div>
      {/* Window times */}
      <div className="flex-1 p-2 grid grid-cols-[auto_1fr] gap-x-1 gap-y-1 items-center">
        <span className="text-gray-400">Start:</span>
        <span className="text-white">{formatTime(window.start)}</span>
        <span className="text-gray-400">End:</span>
        <span className="text-white">{formatTime(window.end)}</span>
      </div>
    </div>
  );
}

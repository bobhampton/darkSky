import { useState, useEffect } from 'react';
import { getActualDarkWindows } from '@/utils/filterUtils';
import { AstronomicalEventsDisplay } from './AstronomicalEventsDisplay';
import type { DarkTimeWindow, DarkTimeMetadata } from '@/types';

interface DarkTimesCardProps {
  date: string;
  windows: DarkTimeWindow[];
  metadata: DarkTimeMetadata | null;
  timezone: string;
  onShowChart?: (date: string) => void;
}

/**
 * Calculate duration in hours and minutes
 */
function calculateDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format time for display
 */
function formatTime(date: Date, timezone: string): string {
  try {
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    return date.toLocaleString('en-US', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}

/**
 * Mobile card view for a single date's dark time data
 */
export function DarkTimesCard({ date, windows, metadata, timezone, onShowChart }: DarkTimesCardProps) {
  const actualWindows = getActualDarkWindows(windows);
  const hasWindows = actualWindows.length > 0;
  
  // Expand dark windows by default when they exist
  const [isExpanded, setIsExpanded] = useState(hasWindows);
  const [showAstro, setShowAstro] = useState(false);
  
  // Sync isExpanded when hasWindows changes (e.g., when data loads)
  useEffect(() => {
    if (hasWindows && !isExpanded) {
      setIsExpanded(true);
    }
  }, [hasWindows, isExpanded, date]);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
      {/* Date Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{date}</h3>
        {onShowChart && hasWindows && (
          <button
            onClick={() => onShowChart(date)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={`View altitude chart for ${date}`}
          >
            View Chart
          </button>
        )}
      </div>

      {/* Dark Windows Summary */}
      <div>
        {!hasWindows ? (
          <p className="text-gray-500 text-sm">No dark time</p>
        ) : (
          <>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 -ml-1"
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} dark windows for ${date}`}
            >
              <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
              <span className="font-medium">
                {actualWindows.length} Dark Window{actualWindows.length !== 1 ? 's' : ''}
              </span>
            </button>

            {/* Expanded Windows */}
            {isExpanded && (
              <div className="mt-3 space-y-3">
                {actualWindows.map((window, idx) => {
                  // Type badge configuration
                  const typeConfig: Record<string, { color: string; label: string; borderColor: string }> = {
                    dawn: { color: 'bg-blue-600', label: 'Dawn', borderColor: 'border-blue-500/30' },
                    dusk: { color: 'bg-orange-600', label: 'Dusk', borderColor: 'border-orange-500/30' },
                    polarNight: { color: 'bg-purple-600', label: 'Polar Night', borderColor: 'border-purple-500/30' },
                  };
                  const config = typeConfig[window.type] || { color: 'bg-gray-600', label: window.type, borderColor: 'border-green-500/30' };

                  return (
                    <div
                      key={idx}
                      className={`flex rounded border ${config.borderColor} overflow-hidden`}
                    >
                      {/* Vertical stripe with rotated text */}
                      <div className={`${config.color} flex items-center justify-center w-8 flex-shrink-0`}>
                        <span className="text-white text-xs font-medium whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                          {config.label}
                        </span>
                      </div>
                      {/* Window content */}
                      <div className="flex-1 bg-gray-700/50 p-3 text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 w-16">Start:</span>
                          <span className="text-white">{formatTime(window.start, timezone)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 w-16">End:</span>
                          <span className="text-white">{formatTime(window.end, timezone)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 w-16">Duration:</span>
                          <span className="text-white">{calculateDuration(window.start, window.end)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Astronomical Events */}
      {metadata && (
        <div>
          <button
            onClick={() => setShowAstro(!showAstro)}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 -ml-1"
            aria-expanded={showAstro}
            aria-label={`${showAstro ? 'Hide' : 'Show'} astronomical events for ${date}`}
          >
            <span className="text-lg">{showAstro ? '▼' : '▶'}</span>
            <span>Astronomical Events</span>
          </button>
          {showAstro && (
            <div className="mt-2">
              <AstronomicalEventsDisplay metadata={metadata} timezone={timezone} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

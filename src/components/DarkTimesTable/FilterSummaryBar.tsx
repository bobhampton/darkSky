import { formatTime12Hour } from '@/utils/dateUtils';
import type { DarkTimeWindow, TimeRangeFilter } from '@/types';

interface FilterSummaryBarProps {
  minDurationHours: number | undefined;
  availableTypes: Set<DarkTimeWindow['type']>;
  selectedTypes: Set<DarkTimeWindow['type']>;
  hideEmptyDays: boolean;
  timeRangeFilter: TimeRangeFilter;
  onClearDuration: () => void;
  onClearTimeRange: () => void;
  onClearTypes: () => void;
  onClearHideEmptyDays: () => void;
  onClearAllFilters: () => void;
}

/**
 * Display active filters with individual clear buttons
 */
export function FilterSummaryBar({
  minDurationHours,
  availableTypes,
  selectedTypes,
  hideEmptyDays,
  timeRangeFilter,
  onClearDuration,
  onClearTimeRange,
  onClearTypes,
  onClearHideEmptyDays,
  onClearAllFilters,
}: FilterSummaryBarProps) {
  const hasActiveFilters =
    (minDurationHours && minDurationHours > 0) ||
    selectedTypes.size < availableTypes.size ||
    hideEmptyDays ||
    timeRangeFilter.enabled;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-l-4 border-blue-500 rounded-r-lg">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600/20 rounded-full">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-blue-300">Active Filters:</span>
          </div>

          {minDurationHours && minDurationHours > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
              Duration ≥ {minDurationHours}h
              <button
                onClick={onClearDuration}
                className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                aria-label="Clear duration filter"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {timeRangeFilter.enabled && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
              {formatTime12Hour(timeRangeFilter.startTime)} - {formatTime12Hour(timeRangeFilter.endTime)}
              <button
                onClick={onClearTimeRange}
                className="hover:bg-indigo-700 rounded-full p-0.5 transition-colors"
                aria-label="Clear time range filter"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {selectedTypes.size < availableTypes.size && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
              Types:{' '}
              {selectedTypes.size === 0
                ? 'None'
                : Array.from(selectedTypes)
                    .map((t) => (t === 'polarNight' ? 'Polar Night' : t.charAt(0).toUpperCase() + t.slice(1)))
                    .join(', ')}
              <button
                onClick={onClearTypes}
                className="hover:bg-purple-700 rounded-full p-0.5 transition-colors"
                aria-label="Clear type filter"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {hideEmptyDays && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
              Hiding empty days
              <button
                onClick={onClearHideEmptyDays}
                className="hover:bg-green-700 rounded-full p-0.5 transition-colors"
                aria-label="Clear hide empty days"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>

        <button
          onClick={onClearAllFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear All
        </button>
      </div>
    </div>
  );
}

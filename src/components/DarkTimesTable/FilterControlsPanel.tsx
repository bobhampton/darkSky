import { TimeRangeFilterInput } from '../TimeRangeFilterInput';
import type { DarkTimeWindow, TimeRangeFilter } from '@/types';

interface FilterControlsPanelProps {
  filtersExpanded: boolean;
  onToggleExpanded: () => void;
  minDurationInput: string;
  minDurationHours: number | undefined;
  availableTypes: Set<DarkTimeWindow['type']>;
  selectedTypes: Set<DarkTimeWindow['type']>;
  hideEmptyDays: boolean;
  timeRangeFilter: TimeRangeFilter;
  onMinDurationChange: (value: string) => void;
  onTypeToggle: (type: DarkTimeWindow['type']) => void;
  onHideEmptyDaysChange: (checked: boolean) => void;
  onTimeRangeChange: (filter: TimeRangeFilter) => void;
}

/**
 * Collapsible panel containing all filter controls
 */
export function FilterControlsPanel({
  filtersExpanded,
  onToggleExpanded,
  minDurationInput,
  minDurationHours,
  availableTypes,
  selectedTypes,
  hideEmptyDays,
  timeRangeFilter,
  onMinDurationChange,
  onTypeToggle,
  onHideEmptyDaysChange,
  onTimeRangeChange,
}: FilterControlsPanelProps) {
  const hasActiveFilters =
    (minDurationHours && minDurationHours > 0) ||
    selectedTypes.size < availableTypes.size ||
    hideEmptyDays ||
    timeRangeFilter.enabled;

  const activeFilterCount = [
    minDurationHours && minDurationHours > 0,
    timeRangeFilter.enabled,
    selectedTypes.size < availableTypes.size,
    hideEmptyDays,
  ].filter(Boolean).length;

  return (
    <div className="mb-6 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Panel Header */}
      <button
        onClick={onToggleExpanded}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-750 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-400"
        aria-expanded={filtersExpanded}
        aria-controls="filter-controls-panel"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          <span className="text-sm font-semibold text-gray-200">Filter Controls</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Panel Content */}
      {filtersExpanded && (
        <div id="filter-controls-panel" className="p-3 border-t border-gray-700" role="region" aria-label="Filter controls">
          {/* Info Banner - Compact */}
          <div className="mb-3 p-2 bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-xs text-blue-200">
                Active filters apply to both the table display and CSV exports.
              </div>
            </div>
          </div>

          {/* Grid Layout for Desktop: Duration + Time Range side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Duration Filter */}
            <div>
              <label htmlFor="min-duration" className="block text-sm font-medium text-gray-300 mb-1.5">
                Minimum Duration (hours)
              </label>
              <input
                type="number"
                id="min-duration"
                min="0"
                step="0.5"
                placeholder="e.g., 2.5"
                value={minDurationInput}
                onChange={(e) => onMinDurationChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="mt-1 text-xs text-gray-400">Filter windows shorter than this duration</p>
            </div>

            {/* Time Range Filter */}
            <div>
              <TimeRangeFilterInput value={timeRangeFilter} onChange={onTimeRangeChange} />
            </div>
          </div>

          {/* Window Types Filter - Horizontal on Desktop */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Window Types</label>
            <div className="flex flex-wrap gap-4">
              {Array.from(availableTypes)
                .sort()
                .map((type) => {
                  const typeLabels: Record<string, string> = {
                    polarNight: 'Polar Night',
                    dawn: 'Dawn',
                    dusk: 'Dusk',
                  };
                  return (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes.has(type)}
                        onChange={() => onTypeToggle(type)}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-300">{typeLabels[type] || type}</span>
                    </label>
                  );
                })}
              {/* Hide Empty Days - inline with window types */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideEmptyDays}
                  onChange={(e) => onHideEmptyDaysChange(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-300">Hide days with no dark windows</span>
              </label>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">Select which types of windows to display</p>
          </div>
        </div>
      )}
    </div>
  );
}

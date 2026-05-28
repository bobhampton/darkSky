import { useState } from 'react';
import { getActualDarkWindows } from '@/utils/filterUtils';
import { FilterSummaryBar } from './DarkTimesTable/FilterSummaryBar';
import { FilterControlsPanel } from './DarkTimesTable/FilterControlsPanel';
import { AstronomicalEventsDisplay } from './DarkTimesTable/AstronomicalEventsDisplay';
import { WindowRow } from './DarkTimesTable/WindowRow';
import { TypeBadge } from './DarkTimesTable/TypeBadge';
import type { DarkTimesData, DarkTimeWindow, DarkTimeMetadata, TimeRangeFilter } from '@/types';

interface DarkTimesTableProps {
  darkTimesData: DarkTimesData;
  timezone: string;
  onShowChart?: (date: string) => void;
  
  // Filter props (controlled by parent)
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
  onClearFilters: () => void;
}

/**
 * Extract metadata from windows array
 * Prefers metaOnly entry if it exists, otherwise uses first window
 */
function getMetadata(windows: DarkTimeWindow[]): DarkTimeMetadata | null {
  const metaOnlyEntry = windows.find((w) => w.type === 'metaOnly');
  if (metaOnlyEntry) return metaOnlyEntry.meta;
  if (windows.length > 0) return windows[0].meta;
  return null;
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
 * Table displaying dark time windows for each date
 */
export function DarkTimesTable({
  darkTimesData,
  timezone,
  onShowChart,
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
  onClearFilters,
}: DarkTimesTableProps) {
  const [collapsedRows, setCollapsedRows] = useState<Set<string>>(new Set());
  const [expandedAstro, setExpandedAstro] = useState<Set<string>>(new Set());
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(true);

  const toggleRow = (date: string) => {
    setCollapsedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const toggleAstro = (date: string) => {
    setExpandedAstro((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const dates = Object.keys(darkTimesData).sort();
  const hasFilteredResults = dates.length > 0;

  const clearDurationFilter = () => {
    onMinDurationChange('');
  };

  const clearTimeRangeFilter = () => {
    onTimeRangeChange({ ...timeRangeFilter, enabled: false });
  };

  const clearTypeFilter = () => {
    // Reset to all available types
    availableTypes.forEach((type) => {
      if (!selectedTypes.has(type)) {
        onTypeToggle(type);
      }
    });
  };

  const clearHideEmptyDays = () => {
    onHideEmptyDaysChange(false);
  };

  return (
    <div className="overflow-x-auto">
      {/* Active Filters Summary */}
      <FilterSummaryBar
        minDurationHours={minDurationHours}
        availableTypes={availableTypes}
        selectedTypes={selectedTypes}
        hideEmptyDays={hideEmptyDays}
        timeRangeFilter={timeRangeFilter}
        onClearDuration={clearDurationFilter}
        onClearTimeRange={clearTimeRangeFilter}
        onClearTypes={clearTypeFilter}
        onClearHideEmptyDays={clearHideEmptyDays}
        onClearAllFilters={onClearFilters}
      />

      {/* Filter Controls */}
      <FilterControlsPanel
        filtersExpanded={filtersExpanded}
        onToggleExpanded={() => setFiltersExpanded(!filtersExpanded)}
        minDurationInput={minDurationInput}
        minDurationHours={minDurationHours}
        availableTypes={availableTypes}
        selectedTypes={selectedTypes}
        hideEmptyDays={hideEmptyDays}
        timeRangeFilter={timeRangeFilter}
        onMinDurationChange={onMinDurationChange}
        onTypeToggle={onTypeToggle}
        onHideEmptyDaysChange={onHideEmptyDaysChange}
        onTimeRangeChange={onTimeRangeChange}
      />

      {/* Results Table or Empty State */}
      {hasFilteredResults ? (
        <table className="w-full text-sm text-left text-gray-300" role="table" aria-label="Dark times results by date">
          <caption className="sr-only">
            Dark times results showing dates, dark windows, astronomical events, and chart options
          </caption>
          <thead className="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">
                Date
              </th>
              <th scope="col" className="px-6 py-3">
                Dark Windows
              </th>
              <th scope="col" className="px-6 py-3">
                Astronomical Events
              </th>
              <th scope="col" className="px-6 py-3">
                Type
              </th>
              <th scope="col" className="px-6 py-3">
                Duration
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => {
              const allWindows = darkTimesData[date];
              const windows = getActualDarkWindows(allWindows);
              const metadata = getMetadata(allWindows);
              const isCollapsed = collapsedRows.has(date);
              const isAstroExpanded = expandedAstro.has(date);

              return (
                <tr key={date} className="border-b border-gray-700 hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{date}</td>
                  <td className="px-6 py-4">
                    {windows.length === 0 ? (
                      <span className="text-gray-500">No dark time</span>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <span>
                            {windows.length} window{windows.length !== 1 ? 's' : ''}
                          </span>
                          {windows.length > 1 && (
                            <button
                              onClick={() => toggleRow(date)}
                              className="text-blue-400 hover:text-blue-300 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                              aria-expanded={!isCollapsed}
                              aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} dark windows for ${date}`}
                            >
                              {isCollapsed ? '▶ Expand' : '▼ Collapse'}
                            </button>
                          )}
                        </div>
                        {!isCollapsed && (
                          <div className="mt-2 space-y-2">
                            {windows.map((window, idx) => (
                              <WindowRow key={idx} window={window} timezone={timezone} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleAstro(date)}
                      className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                      aria-expanded={isAstroExpanded}
                      aria-label={`${isAstroExpanded ? 'Hide' : 'Show'} astronomical events for ${date}`}
                    >
                      {isAstroExpanded ? '▼ Hide' : '▶ Show'}
                    </button>
                    {isAstroExpanded && metadata && <AstronomicalEventsDisplay metadata={metadata} timezone={timezone} />}
                  </td>
                  <td className="px-6 py-4">
                    {windows.length > 0 && (
                      <div className="space-y-2">
                        {windows.map((window, idx) => (
                          <div key={idx}>
                            <TypeBadge type={window.type} />
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {windows.length > 0 && (
                      <div className="space-y-1">
                        {windows.map((window, idx) => (
                          <div key={idx}>{calculateDuration(window.start, window.end)}</div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {onShowChart && (
                      <button
                        onClick={() => onShowChart(date)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label={`View altitude chart for ${date}`}
                      >
                        View Chart
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="mt-6 p-8 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg text-center">
          <div className="flex flex-col items-center gap-4">
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No Results Match Current Filters</h3>
              <p className="text-gray-400 mb-4">Try adjusting your filter settings above to see more results.</p>
              <button
                onClick={onClearFilters}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export TypeBadge for backwards compatibility
export { TypeBadge } from './DarkTimesTable/TypeBadge';

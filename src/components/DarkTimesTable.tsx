import { useState } from 'react';
import { DEFAULT_TIMEZONE } from '@/utils/timezones';
import { getActualDarkWindows } from '@/utils/filterUtils';
import { formatTime12Hour } from '@/utils/dateUtils';
import { TimeRangeFilterInput } from './TimeRangeFilterInput';
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
  const metaOnlyEntry = windows.find(w => w.type === 'metaOnly');
  if (metaOnlyEntry) return metaOnlyEntry.meta;
  if (windows.length > 0) return windows[0].meta;
  return null;
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
  onClearFilters
}: DarkTimesTableProps) {
  const [collapsedRows, setCollapsedRows] = useState<Set<string>>(new Set());
  const [expandedAstro, setExpandedAstro] = useState<Set<string>>(new Set());
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(true);

  const toggleRow = (date: string) => {
    setCollapsedRows(prev => {
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
    setExpandedAstro(prev => {
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
  const hasActiveFilters = minDurationHours && minDurationHours > 0 || selectedTypes.size < availableTypes.size || hideEmptyDays || timeRangeFilter.enabled;

  const clearDurationFilter = () => {
    onMinDurationChange('');
  };

  const clearTimeRangeFilter = () => {
    onTimeRangeChange({ ...timeRangeFilter, enabled: false });
  };

  const clearTypeFilter = () => {
    // Reset to all available types
    availableTypes.forEach(type => {
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
      {/* Active Filters Summary Bar */}
      {hasActiveFilters && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-l-4 border-blue-500 rounded-r-lg">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600/20 rounded-full">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-blue-300">Active Filters:</span>
              </div>
              
              {minDurationHours && minDurationHours > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                  Duration ≥ {minDurationHours}h
                  <button
                    onClick={clearDurationFilter}
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
                    onClick={clearTimeRangeFilter}
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
                  Types: {selectedTypes.size === 0
                    ? 'None'
                    : Array.from(selectedTypes).map(t => 
                        t === 'polarNight' ? 'Polar Night' : t.charAt(0).toUpperCase() + t.slice(1)
                      ).join(', ')
                  }
                  <button
                    onClick={clearTypeFilter}
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
                    onClick={clearHideEmptyDays}
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
              onClick={onClearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-xs font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Filter Controls Panel */}
      <div className="mb-6 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        {/* Panel Header */}
        <button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-sm font-semibold text-gray-200">Filter Controls</span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded-full">
                {[
                  minDurationHours && minDurationHours > 0,
                  timeRangeFilter.enabled,
                  selectedTypes.size < availableTypes.size,
                  hideEmptyDays
                ].filter(Boolean).length}
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
          <div className="p-4 space-y-6 border-t border-gray-700">
            {/* Info Banner */}
            <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-xs text-blue-200">
                  Active filters apply to both the table display and CSV exports.
                </div>
              </div>
            </div>

            {/* Duration & Time Range Filters */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Time & Duration</h3>
              </div>
              <div className="flex items-start gap-6">
                <div className="flex-1 max-w-xs">
                  <label htmlFor="minDuration" className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Duration
                  </label>
                  <input
                    id="minDuration"
                    type="number"
                    min="0"
                    step="0.25"
                    value={minDurationInput}
                    onChange={(e) => onMinDurationChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="e.g., 2.0 (hours)"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Show windows with at least this duration
                  </p>
                </div>

                <div className="flex-1 max-w-md">
                  <TimeRangeFilterInput
                    value={timeRangeFilter}
                    onChange={onTimeRangeChange}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700"></div>

            {/* Window Type Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Window Types</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTypes.has('dawn') && (
                  <label className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedTypes.has('dawn')}
                      onChange={() => onTypeToggle('dawn')}
                      className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                    />
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-200">
                      <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                      Dawn
                    </span>
                  </label>
                )}
                {availableTypes.has('dusk') && (
                  <label className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedTypes.has('dusk')}
                      onChange={() => onTypeToggle('dusk')}
                      className="w-4 h-4 text-orange-600 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                    />
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-200">
                      <span className="w-3 h-3 rounded-full bg-orange-600"></span>
                      Dusk
                    </span>
                  </label>
                )}
                {availableTypes.has('polarNight') && (
                  <label className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedTypes.has('polarNight')}
                      onChange={() => onTypeToggle('polarNight')}
                      className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                    />
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-200">
                      <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                      Polar Night
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700"></div>

            {/* Display Options */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Display Options</h3>
              </div>
              <label className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors w-fit">
                <input
                  type="checkbox"
                  checked={hideEmptyDays}
                  onChange={(e) => onHideEmptyDaysChange(e.target.checked)}
                  className="w-4 h-4 text-green-600 bg-gray-600 border-gray-500 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-200">
                  Hide days with no dark windows
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Table or Empty State */}
      {hasFilteredResults ? (
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs uppercase bg-gray-700 text-gray-400">
          <tr>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Dark Windows</th>
            <th className="px-6 py-3">Astronomical Events</th>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">Duration</th>
            <th className="px-6 py-3">Actions</th>
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
              <tr key={date} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                  {date}
                </td>
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
                            className="text-blue-400 hover:text-blue-300 text-xs"
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
                    className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                  >
                    {isAstroExpanded ? '▼ Hide' : '▶ Show'}
                  </button>
                  {isAstroExpanded && metadata && (
                    <AstronomicalEventsDisplay metadata={metadata} timezone={timezone} />
                  )}
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
                        <div key={idx}>
                          {calculateDuration(window.start, window.end)}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {onShowChart && (
                    <button
                      onClick={() => onShowChart(date)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                No Results Match Current Filters
              </h3>
              <p className="text-gray-400 mb-4">
                Try adjusting your filter settings above to see more results.
              </p>
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

/**
 * Display astronomical event times
 */
function AstronomicalEventsDisplay({ metadata, timezone }: { metadata: DarkTimeMetadata; timezone: string }) {
  const formatTime = (date: Date | null) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString('en-US', {
        timeZone: timezone,
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      // Fallback to UTC if timezone formatting fails
      console.warn(`Timezone formatting error, falling back to ${DEFAULT_TIMEZONE}:`, error);
      return new Date(date).toLocaleString('en-US', {
        timeZone: DEFAULT_TIMEZONE,
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  return (
    <div className="mt-2 text-xs space-y-1 bg-gray-700/30 p-2 rounded border border-green-500/30">
      <div>
        <span className="text-gray-400">
          Astronomical Night Start{metadata.astronomicalNightStarts.length > 1 ? 's' : ''}:
        </span>{' '}
        {metadata.astronomicalNightStarts.length === 0 ? (
          <span className="text-white italic">
            {metadata.sunContinuouslyAboveTwilight
              ? 'Sun continuously above twilight limit'
              : metadata.sunContinuouslyBelowTwilight
              ? 'Sun continuously below twilight limit'
              : 'N/A'}
          </span>
        ) : (
          <div className="text-white space-y-0.5 ml-2">
            {metadata.astronomicalNightStarts.map((start, idx) => (
              <div key={idx}>{formatTime(start)}</div>
            ))}
          </div>
        )}
      </div>
      <div>
        <span className="text-gray-400">
          Astronomical Night End{metadata.astronomicalNightEnds.length > 1 ? 's' : ''}:
        </span>{' '}
        {metadata.astronomicalNightEnds.length === 0 ? (
          <span className="text-white italic">
            {metadata.sunContinuouslyAboveTwilight
              ? 'Sun continuously above twilight limit'
              : metadata.sunContinuouslyBelowTwilight
              ? 'Sun continuously below twilight limit'
              : 'N/A'}
          </span>
        ) : (
          <div className="text-white space-y-0.5 ml-2">
            {metadata.astronomicalNightEnds.map((end, idx) => (
              <div key={idx}>{formatTime(end)}</div>
            ))}
          </div>
        )}
      </div>
      <div>
        <span className="text-gray-400">
          Moon Rise{metadata.moonRises.length > 1 ? 's' : ''}:
        </span>{' '}
        {metadata.moonRises.length === 0 ? (
          <span className="text-white italic">
            {metadata.moonContinuouslyAboveHorizon
              ? 'Moon continuously above horizon'
              : metadata.moonContinuouslyBelowHorizon
              ? 'Moon continuously below horizon'
              : 'N/A'}
          </span>
        ) : (
          <div className="text-white space-y-0.5 ml-2">
            {metadata.moonRises.map((rise, idx) => (
              <div key={idx}>{formatTime(rise)}</div>
            ))}
          </div>
        )}
      </div>
      <div>
        <span className="text-gray-400">
          Moon Set{metadata.moonSets.length > 1 ? 's' : ''}:
        </span>{' '}
        {metadata.moonSets.length === 0 ? (
          <span className="text-white italic">
            {metadata.moonContinuouslyAboveHorizon
              ? 'Moon continuously above horizon'
              : metadata.moonContinuouslyBelowHorizon
              ? 'Moon continuously below horizon'
              : 'N/A'}
          </span>
        ) : (
          <div className="text-white space-y-0.5 ml-2">
            {metadata.moonSets.map((set, idx) => (
              <div key={idx}>{formatTime(set)}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Display a single dark time window
 */
function WindowRow({ window, timezone }: { window: DarkTimeWindow; timezone: string }) {
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

/**
 * Badge for window type
 */
export function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    polarNight: 'bg-purple-600',
    dawn: 'bg-blue-600',
    dusk: 'bg-orange-600',
    metaOnly: 'bg-gray-600',
  };

  const labels: Record<string, string> = {
    polarNight: 'Polar Night',
    dawn: 'Dawn',
    dusk: 'Dusk',
    metaOnly: 'Info',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs text-white ${colors[type] || 'bg-gray-600'}`}>
      {labels[type] || type}
    </span>
  );
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

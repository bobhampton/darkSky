import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useObserver } from '@/context';
import { useAstronomy, usePageMetadata } from '@/hooks';
import { getValidTimezone } from '@/utils/timezones';
import { filterDarkTimesData, getAvailableWindowTypes } from '@/utils/filterUtils';
import {
  Header,
  ObserverForm,
  LoadingSpinner,
  DarkTimesTable,
  ExportControls,
  LazyChartModal,
  ErrorDisplay,
} from '@/components';
import type { ObserverFormData, TimeRangeFilter } from '@/types';
import type { DarkTimeWindow } from '@/types/astronomy.types';

/**
 * Home page - Main dark times calculator
 */
export function HomePage() {
  usePageMetadata({
    title: 'darkSky Calculator - Dark Sky Times for Light Pollution Monitoring & Astronomy',
    description: 'Free dark sky calculator for light pollution monitoring, astronomy, and astrophotography. Calculate when the sun is 18° below the horizon (astronomical twilight) with no moon in the sky. Support citizen science initiatives for long-term night sky monitoring.',
  });

  const { observerData, updateObserverData } = useObserver();
  const { darkTimesData, isCalculating, error, progress, calculateDarkTimes } = useAstronomy();
  const [showChart, setShowChart] = useState<string | null>(null);
  const [lastCalculationParams, setLastCalculationParams] = useState<typeof observerData | null>(null);
  const shouldScrollToResults = useRef(false);
  
  // Filter state
  const [minDurationInput, setMinDurationInput] = useState<string>('');
  const [minDurationHours, setMinDurationHours] = useState<number | undefined>(undefined);
  const [availableTypes, setAvailableTypes] = useState<Set<DarkTimeWindow['type']>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<DarkTimeWindow['type']>>(new Set());
  const [hideEmptyDays, setHideEmptyDays] = useState<boolean>(false);
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRangeFilter>({
    startTime: '21:00', // 9:00 PM
    endTime: '22:00',   // 10:00 PM
    enabled: false,
  });

  // Detect available window types when data changes
  useEffect(() => {
    if (darkTimesData && Object.keys(darkTimesData).length > 0) {
      const types = getAvailableWindowTypes(darkTimesData);
      setAvailableTypes(types);
      // Initialize selected types to all available types
      setSelectedTypes(types);
    } else {
      setAvailableTypes(new Set());
      setSelectedTypes(new Set());
    }
  }, [darkTimesData]);

  // Scroll to results after calculation completes
  useEffect(() => {
    if (!isCalculating && shouldScrollToResults.current && darkTimesData && Object.keys(darkTimesData).length > 0) {
      // Wait a brief moment for DOM to update, then scroll
      setTimeout(() => {
        const resultsElement = document.getElementById('results-heading');
        if (resultsElement) {
          // Get the element's position
          const elementPosition = resultsElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - 90; // 90px offset for navbar (64px) + padding

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
        shouldScrollToResults.current = false;
      }, 100);
    }
  }, [isCalculating, darkTimesData]);

  // Apply filters to create filtered dataset
  const filteredDarkTimesData = useMemo(() => {
    if (!darkTimesData) return {};
    
    return filterDarkTimesData(darkTimesData, {
      minDurationHours,
      selectedTypes,
      hideEmptyDays,
      timeRange: timeRangeFilter,
      timezone: getValidTimezone(observerData.timezone),
    });
  }, [darkTimesData, minDurationHours, selectedTypes, hideEmptyDays, timeRangeFilter, observerData.timezone]);

  const handleFormSubmit = (formData: ObserverFormData) => {
    // Update observer context
    updateObserverData(formData);

    // Store params for retry
    setLastCalculationParams(formData);

    // Flag to scroll to results when calculation completes
    shouldScrollToResults.current = true;

    // Trigger calculations with validated timezone
    calculateDarkTimes({
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      elevation: parseFloat(formData.elevation),
      timezone: getValidTimezone(formData.timezone),
      dateStart: formData.dateStart,
      dateEnd: formData.dateEnd,
    });
  };

  const handleRetry = () => {
    if (lastCalculationParams) {
      handleFormSubmit(lastCalculationParams);
    }
  };

  const handleShowChart = (date: string) => {
    setShowChart(date);
  };

  const handleCloseChart = () => {
    setShowChart(null);
  };

  const handleMinDurationChange = (value: string) => {
    setMinDurationInput(value);
    
    if (!value || value.trim() === '') {
      setMinDurationHours(undefined);
    } else {
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && parsed >= 0) {
        setMinDurationHours(parsed);
      } else {
        setMinDurationHours(undefined);
      }
    }
  };

  const handleTypeToggle = (type: DarkTimeWindow['type']) => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleClearFilters = () => {
    setMinDurationInput('');
    setMinDurationHours(undefined);
    // Reset to all available types (dynamic, not hardcoded)
    setSelectedTypes(new Set(availableTypes));
    setHideEmptyDays(false);
    setTimeRangeFilter({
      startTime: '21:00',
      endTime: '22:00',
      enabled: false,
    });
  };

  const hasResults = darkTimesData && Object.keys(darkTimesData).length > 0;

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header />

        <main className="space-y-8">
          {/* Observer Form */}
          <section className="bg-gray-900/60 border-2 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] rounded-lg p-6" aria-labelledby="config-heading">
            <h2 id="config-heading" className="text-xl font-semibold mb-4">Observer Configuration</h2>
            <ObserverForm
              onSubmit={handleFormSubmit}
              isCalculating={isCalculating}
            />
          </section>

          {/* Loading State */}
          {isCalculating && (
            <div className="flex justify-center py-12" role="status" aria-live="polite" aria-label="Calculating dark times">
              <LoadingSpinner progress={progress || undefined} />
            </div>
          )}

          {/* Error State */}
          {error && !isCalculating && (
            <div role="alert" aria-live="assertive">
              <ErrorDisplay error={error} onRetry={handleRetry} />
            </div>
          )}

          {/* Results */}
          {hasResults && !isCalculating && (
            <>
              <section className="bg-gray-800 rounded-lg shadow-lg p-6" aria-labelledby="results-heading">
                <div className="flex items-center justify-between mb-4">
                  <h2 id="results-heading" className="text-xl font-semibold">Dark Times Results</h2>
                  <ExportControls
                    darkTimesData={filteredDarkTimesData}
                    timezone={getValidTimezone(observerData.timezone)}
                    formData={{
                      latitude: observerData.latitude,
                      longitude: observerData.longitude,
                      elevation: observerData.elevation,
                      dateStart: observerData.dateStart,
                      dateEnd: observerData.dateEnd,
                    }}
                    filterInfo={{
                      minDurationHours,
                      selectedTypes,
                      hideEmptyDays,
                      timeRangeFilter,
                    }}
                  />
                </div>
                <DarkTimesTable
                  darkTimesData={filteredDarkTimesData}
                  timezone={getValidTimezone(observerData.timezone)}
                  onShowChart={handleShowChart}
                  minDurationInput={minDurationInput}
                  minDurationHours={minDurationHours}
                  availableTypes={availableTypes}
                  selectedTypes={selectedTypes}
                  hideEmptyDays={hideEmptyDays}
                  timeRangeFilter={timeRangeFilter}
                  onMinDurationChange={handleMinDurationChange}
                  onTypeToggle={handleTypeToggle}
                  onHideEmptyDaysChange={setHideEmptyDays}
                  onTimeRangeChange={setTimeRangeFilter}
                  onClearFilters={handleClearFilters}
                />
              </section>
            </>
          )}

          {/* Empty State */}
          {!hasResults && !isCalculating && !error && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-4">
                Enter your observer location and date range above to calculate dark times.
              </p>
              <p className="text-sm">
                New to the calculator?{' '}
                <Link
                  to="/getting-started"
                  className="text-blue-400 hover:text-blue-300 underline transition-colors"
                >
                  View the Getting Started guide
                </Link>
                {' '}or check out our{' '}
                <Link
                  to="/faq"
                  className="text-blue-400 hover:text-blue-300 underline transition-colors"
                >
                  FAQ
                </Link>
                .
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Chart Modal */}
      {showChart && (
        <LazyChartModal
          date={showChart}
          observerConfig={{
            latitude: parseFloat(observerData.latitude),
            longitude: parseFloat(observerData.longitude),
            elevation: parseFloat(observerData.elevation),
            timezone: observerData.timezone,
          }}
          onClose={handleCloseChart}
        />
      )}
    </>
  );
}

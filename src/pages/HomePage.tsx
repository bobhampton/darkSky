import { useState, useEffect, useEffectEvent, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useObserver } from '@/context';
import { useAstronomy, usePageMetadata, useFilters } from '@/hooks';
import { PAGES } from '@/seo/routes';
import { DEFAULT_TIMEZONE, getTimezoneFromCoordinates, getValidTimezone } from '@/utils/timezones';
import { getDefaultDateRange } from '@/utils/dateUtils';
import { parseShareParams } from '@/utils/shareLink';
import { validateFormData } from '@/utils/validation';
import {
  Header,
  ObserverForm,
  LoadingSpinner,
  DarkTimesTable,
  ExportControls,
  ShareLinkButton,
  LazyChartModal,
  ErrorDisplay,
} from '@/components';
import type { ObserverFormData } from '@/types';

/**
 * Home page - Main dark times calculator
 */
export function HomePage() {
  usePageMetadata(PAGES.home);

  const { observerData, updateObserverData } = useObserver();
  const { darkTimesData, isCalculating, error, progress, calculateDarkTimes } = useAstronomy();
  const filters = useFilters({
    darkTimesData,
    timezone: getValidTimezone(observerData.timezone),
  });
  const [showChart, setShowChart] = useState<string | null>(null);
  const [lastCalculationParams, setLastCalculationParams] = useState<typeof observerData | null>(null);
  const shouldScrollToResults = useRef(false);
  const appliedShareLink = useRef(false);
  const { search } = useLocation();

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

  // Open a shared results link (e.g. /?lat=40.76&lon=-111.89&...)
  const openSharedLink = useEffectEvent(async () => {
    const shared = parseShareParams(search);
    if (!shared) return;

    const timezone =
      shared.timezone ??
      (await getTimezoneFromCoordinates(parseFloat(shared.latitude), parseFloat(shared.longitude))) ??
      DEFAULT_TIMEZONE;
    const defaultDates = getDefaultDateRange();
    const formData: ObserverFormData = {
      latitude: shared.latitude,
      longitude: shared.longitude,
      elevation: shared.elevation ?? '0',
      dateStart: shared.dateStart ?? defaultDates.dateStart,
      dateEnd: shared.dateEnd ?? defaultDates.dateEnd,
      timezone,
      address: shared.address ?? '',
    };

    // Fill in the form either way, but only calculate if the link is fully valid
    if (validateFormData(formData).length === 0) {
      handleFormSubmit(formData);
    } else {
      updateObserverData(formData);
    }
  });

  // Only on load; the ref stops StrictMode's double effect from calculating twice
  useEffect(() => {
    if (appliedShareLink.current) return;
    appliedShareLink.current = true;
    openSharedLink();
  }, []);

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
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <h2 id="results-heading" className="text-xl font-semibold">Dark Times Results</h2>
                  <div className="flex flex-wrap gap-4">
                    {lastCalculationParams && <ShareLinkButton formData={lastCalculationParams} />}
                    <ExportControls
                      darkTimesData={filters.filteredData}
                      timezone={getValidTimezone(observerData.timezone)}
                      formData={{
                        latitude: observerData.latitude,
                        longitude: observerData.longitude,
                        elevation: observerData.elevation,
                        dateStart: observerData.dateStart,
                        dateEnd: observerData.dateEnd,
                      }}
                      filterInfo={{
                        minDurationHours: filters.minDurationHours,
                        selectedTypes: filters.selectedTypes,
                        hideEmptyDays: filters.hideEmptyDays,
                        timeRangeFilter: filters.timeRangeFilter,
                      }}
                    />
                  </div>
                </div>
                <DarkTimesTable
                  darkTimesData={filters.filteredData}
                  timezone={getValidTimezone(observerData.timezone)}
                  onShowChart={handleShowChart}
                  filters={filters}
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

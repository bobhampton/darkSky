import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_TIMEZONE } from '@/utils/timezones';
import { getDefaultDateRange } from '@/utils/dateUtils';
import type { ObserverFormData } from '@/types';

interface ObserverContextType {
  observerData: ObserverFormData;
  updateObserverData: (data: Partial<ObserverFormData>) => void;
  resetObserverData: () => void;
}

const ObserverContext = createContext<ObserverContextType | undefined>(undefined);

// Default observer data - starts empty except for timezone.
// Dates are filled in after mount: pages are prerendered at build time, so "today"
// in the initial render would be the build date and wouldn't match after hydration.
const defaultObserverData: ObserverFormData = {
  latitude: '',
  longitude: '',
  elevation: '0',
  dateStart: '',
  dateEnd: '',
  timezone: DEFAULT_TIMEZONE, // UTC until location is chosen
};

interface ObserverProviderProps {
  children: ReactNode;
}

/**
 * Provider component for observer data
 * Manages observer form state (no persistence - fresh start each session)
 */
export function ObserverProvider({ children }: ObserverProviderProps) {
  const [observerData, setObserverData] = useState<ObserverFormData>(defaultObserverData);

  // Default to the next 7 days unless dates were already set (e.g. from a shared link).
  // This must run after hydration because it depends on the visitor's clock.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setObserverData((prev) =>
      prev.dateStart || prev.dateEnd ? prev : { ...prev, ...getDefaultDateRange() }
    );
  }, []);

  // Clean up old localStorage entry from previous version (run once on mount)
  useEffect(() => {
    const oldKey = 'darksky-observer-data';
    if (localStorage.getItem(oldKey)) {
      localStorage.removeItem(oldKey);
      console.log('Cleaned up old observer data from localStorage');
    }
  }, []);

  const updateObserverData = (data: Partial<ObserverFormData>) => {
    setObserverData((prev) => ({ ...prev, ...data }));
  };

  const resetObserverData = () => {
    setObserverData({ ...defaultObserverData, ...getDefaultDateRange() });
  };

  return (
    <ObserverContext.Provider
      value={{
        observerData,
        updateObserverData,
        resetObserverData,
      }}
    >
      {children}
    </ObserverContext.Provider>
  );
}

/**
 * Hook to access observer context
 * Must be used within ObserverProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useObserver() {
  const context = useContext(ObserverContext);
  if (context === undefined) {
    throw new Error('useObserver must be used within an ObserverProvider');
  }
  return context;
}

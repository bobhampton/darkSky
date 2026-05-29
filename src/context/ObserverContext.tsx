import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_TIMEZONE } from '@/utils/timezones';
import type { ObserverFormData } from '@/types';

interface ObserverContextType {
  observerData: ObserverFormData;
  updateObserverData: (data: Partial<ObserverFormData>) => void;
  resetObserverData: () => void;
}

const ObserverContext = createContext<ObserverContextType | undefined>(undefined);

// Default observer data - starts empty except for dates and timezone
const defaultObserverData: ObserverFormData = {
  latitude: '',
  longitude: '',
  elevation: '0',
  dateStart: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  dateEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
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
    setObserverData(defaultObserverData);
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
export function useObserver() {
  const context = useContext(ObserverContext);
  if (context === undefined) {
    throw new Error('useObserver must be used within an ObserverProvider');
  }
  return context;
}

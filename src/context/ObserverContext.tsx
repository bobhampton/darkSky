import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '@/hooks';
import { DEFAULT_TIMEZONE } from '@/utils/timezones';
import type { ObserverFormData } from '@/types';

interface ObserverContextType {
  observerData: ObserverFormData;
  updateObserverData: (data: Partial<ObserverFormData>) => void;
  resetObserverData: () => void;
}

const ObserverContext = createContext<ObserverContextType | undefined>(undefined);

// Default observer data
const defaultObserverData: ObserverFormData = {
  latitude: '40.7128',
  longitude: '-74.006',
  elevation: '0',
  dateStart: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  dateEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE,
  saveDefaultTimezone: false,
};

interface ObserverProviderProps {
  children: ReactNode;
}

/**
 * Provider component for observer data
 * Manages observer form state with localStorage persistence
 */
export function ObserverProvider({ children }: ObserverProviderProps) {
  const [observerData, setObserverData, resetStorage] = useLocalStorage<ObserverFormData>(
    'darksky-observer-data',
    defaultObserverData
  );

  const updateObserverData = (data: Partial<ObserverFormData>) => {
    setObserverData((prev) => ({ ...prev, ...data }));
  };

  const resetObserverData = () => {
    resetStorage();
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

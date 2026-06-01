import { useReducer, useCallback } from 'react';
import type { LocationData } from '@/types';

export type TabType = 'search' | 'saved';

interface LocationPickerState {
  activeTab: TabType;
  hasInteracted: boolean;
  locationSource: TabType | null;
  pendingLocation: LocationData | null;
  showSaveDialog: boolean;
  saveNickname: string;
  selectedSavedLocationId: string | undefined;
}

type LocationPickerAction =
  | { type: 'SET_ACTIVE_TAB'; payload: TabType }
  | { type: 'SET_LOCATION_SOURCE'; payload: TabType | null }
  | { type: 'SET_PENDING_LOCATION'; payload: LocationData | null }
  | { type: 'CLEAR_PENDING_LOCATION' }
  | { type: 'SHOW_SAVE_DIALOG' }
  | { type: 'HIDE_SAVE_DIALOG' }
  | { type: 'SET_SAVE_NICKNAME'; payload: string }
  | { type: 'SELECT_SAVED_LOCATION'; payload: string }
  | { type: 'CLEAR_SAVED_SELECTION' }
  | { type: 'HANDLE_SEARCH_INTERACTION' }
  | { type: 'HANDLE_SAVED_INTERACTION'; payload: string }
  | { type: 'CANCEL_SAVE_DIALOG' }
  | { type: 'COMPLETE_SAVE' }
  | { type: 'CLEAR_ALL' };

const initialState: LocationPickerState = {
  activeTab: 'search',
  hasInteracted: false,
  locationSource: null,
  pendingLocation: null,
  showSaveDialog: false,
  saveNickname: '',
  selectedSavedLocationId: undefined,
};

function locationPickerReducer(
  state: LocationPickerState,
  action: LocationPickerAction
): LocationPickerState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_LOCATION_SOURCE':
      return { ...state, locationSource: action.payload };

    case 'SET_PENDING_LOCATION':
      return { ...state, pendingLocation: action.payload };

    case 'CLEAR_PENDING_LOCATION':
      return { ...state, pendingLocation: null };

    case 'SHOW_SAVE_DIALOG':
      return { ...state, showSaveDialog: true };

    case 'HIDE_SAVE_DIALOG':
      return { ...state, showSaveDialog: false };

    case 'SET_SAVE_NICKNAME':
      return { ...state, saveNickname: action.payload };

    case 'SELECT_SAVED_LOCATION':
      return { ...state, selectedSavedLocationId: action.payload };

    case 'CLEAR_SAVED_SELECTION':
      return { ...state, selectedSavedLocationId: undefined };

    case 'HANDLE_SEARCH_INTERACTION':
      // When user interacts with search tab
      return {
        ...state,
        hasInteracted: true,
        locationSource: 'search',
        selectedSavedLocationId: undefined,
      };

    case 'HANDLE_SAVED_INTERACTION':
      // When user selects a saved location
      return {
        ...state,
        hasInteracted: true,
        locationSource: 'saved',
        selectedSavedLocationId: action.payload,
      };

    case 'CANCEL_SAVE_DIALOG':
      // Cancel save dialog and clear nickname
      return {
        ...state,
        showSaveDialog: false,
        saveNickname: '',
      };

    case 'COMPLETE_SAVE':
      // After successfully saving a location
      return {
        ...state,
        showSaveDialog: false,
        saveNickname: '',
      };

    case 'CLEAR_ALL':
      // Reset to initial state (when clearing location)
      return {
        ...state,
        hasInteracted: false,
        locationSource: null,
        pendingLocation: null,
        showSaveDialog: false,
        selectedSavedLocationId: undefined,
      };

    default:
      return state;
  }
}

/**
 * Custom hook to manage LocationPicker UI state with reducer pattern
 * Provides clear state transitions and eliminates scattered setState calls
 */
export function useLocationPickerState() {
  const [state, dispatch] = useReducer(locationPickerReducer, initialState);

  // Action creators for cleaner API
  const actions = {
    setActiveTab: useCallback((tab: TabType) => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
    }, []),

    setPendingLocation: useCallback((location: LocationData | null) => {
      dispatch({ type: 'SET_PENDING_LOCATION', payload: location });
    }, []),

    clearPendingLocation: useCallback(() => {
      dispatch({ type: 'CLEAR_PENDING_LOCATION' });
    }, []),

    showSaveDialog: useCallback(() => {
      dispatch({ type: 'SHOW_SAVE_DIALOG' });
    }, []),

    setSaveNickname: useCallback((nickname: string) => {
      dispatch({ type: 'SET_SAVE_NICKNAME', payload: nickname });
    }, []),

    cancelSaveDialog: useCallback(() => {
      dispatch({ type: 'CANCEL_SAVE_DIALOG' });
    }, []),

    completeSave: useCallback(() => {
      dispatch({ type: 'COMPLETE_SAVE' });
    }, []),

    handleSearchInteraction: useCallback(() => {
      dispatch({ type: 'HANDLE_SEARCH_INTERACTION' });
    }, []),

    handleSavedInteraction: useCallback((locationId: string) => {
      dispatch({ type: 'HANDLE_SAVED_INTERACTION', payload: locationId });
    }, []),

    clearSavedSelection: useCallback((locationId?: string) => {
      if (state.selectedSavedLocationId === locationId) {
        dispatch({ type: 'CLEAR_SAVED_SELECTION' });
      }
    }, [state.selectedSavedLocationId]),

    clearAll: useCallback(() => {
      dispatch({ type: 'CLEAR_ALL' });
    }, []),
  };

  return {
    state,
    actions,
  };
}

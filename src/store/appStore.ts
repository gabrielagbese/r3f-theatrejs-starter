/**
 * App Store - Global State Management with Zustand
 * 
 * This is a template Zustand store for managing global application state.
 * Customize this to match your application's needs.
 * 
 * Zustand Benefits:
 * - Minimal boilerplate
 * - No context providers needed
 * - Works outside of React components
 * - Built-in devtools support
 * 
 * Usage in components:
 * 
 * import { useAppStore } from '@/store/appStore';
 * 
 * function MyComponent() {
 *   const { currentSection, setCurrentSection } = useAppStore();
 *   // ...
 * }
 */

import { create } from 'zustand';

// ============================================================================
// TYPES
// ============================================================================

interface AppState {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------
  
  /** Currently visible section (for scroll indicators) */
  currentSection: string;
  
  /** Whether the app is in dark mode */
  isDarkMode: boolean;
  
  /** Current Theatre.js sequence position */
  sequencePosition: number;
  
  // -------------------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------------------
  
  /** Set the current section */
  setCurrentSection: (section: string) => void;
  
  /** Toggle dark mode */
  toggleDarkMode: () => void;
  
  /** Update the sequence position */
  setSequencePosition: (position: number) => void;
}

// ============================================================================
// STORE
// ============================================================================

export const useAppStore = create<AppState>((set) => ({
  // -------------------------------------------------------------------------
  // INITIAL STATE
  // -------------------------------------------------------------------------
  
  currentSection: 'section-1',
  isDarkMode: true, // Default to dark mode for 3D scenes
  sequencePosition: 0,
  
  // -------------------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------------------
  
  setCurrentSection: (section) => set({ currentSection: section }),
  
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  setSequencePosition: (position) => set({ sequencePosition: position }),
}));

// ============================================================================
// SELECTORS (Optional - for performance optimization)
// ============================================================================

/**
 * Example selector - use when you only need part of the state
 * to avoid unnecessary re-renders.
 * 
 * Usage:
 * const currentSection = useAppStore(selectCurrentSection);
 */
export const selectCurrentSection = (state: AppState) => state.currentSection;
export const selectIsDarkMode = (state: AppState) => state.isDarkMode;
export const selectSequencePosition = (state: AppState) => state.sequencePosition;

import { create } from 'zustand';
import { useEffect } from 'react';
import { useColorScheme } from 'nativewind';

import { themePalettes, type ThemeMode, type ThemePalette } from './colors';

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

/**
 * Instant 1-tap theme toggle (Module 1). Persisted via the same SecureStore
 * adapter already used by `useAgentConfig`, so the choice survives app
 * restarts without needing a new storage dependency.
 */
export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'dark',
  toggleTheme: () => set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
  setTheme: (mode) => set({ mode }),
}));

/** Convenience hook returning the resolved palette object for the active mode. */
export function useThemePalette(): ThemePalette {
  const mode = useThemeStore((state) => state.mode);
  return themePalettes[mode];
}

/**
 * Module 3 theme engine fix: binds NativeWind's actual `dark` class engine
 * to `useThemeStore.mode`, instead of leaving `dark:` variants following the
 * OS appearance setting. Mount this once near the app root (`AppShell`).
 * Any component that uses `dark:` prefixed Tailwind classes going forward
 * will now correctly respond to the in-app toggle rather than system theme.
 */
export function useSyncNativeWindColorScheme(): void {
  const mode = useThemeStore((state) => state.mode);
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    // Guard against redundant `setColorScheme` calls, and intentionally
    // depend only on `mode` (not `colorScheme`/`setColorScheme`, whose
    // references change on every NativeWind-driven re-render). Depending on
    // them here previously caused an infinite render loop: calling
    // `setColorScheme` re-renders every NativeWind-subscribed component
    // (including this one) with a new `setColorScheme` reference, which
    // re-fired this effect again forever, pegging the JS thread and making
    // the whole app (typing, taps) appear frozen/locked.
    if (colorScheme !== mode) {
      setColorScheme(mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
}

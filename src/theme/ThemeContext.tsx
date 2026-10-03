import React, { createContext, useContext, useMemo, useState } from 'react';

import { themeTokens, type AppThemeTokens, type ThemeMode } from './tokens';

interface ThemeContextValue {
  mode: ThemeMode;
  theme: ThemeMode;
  tokens: AppThemeTokens;
  colors: AppThemeTokens;
  setMode: (mode: ThemeMode) => void;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  theme: 'dark',
  tokens: themeTokens.dark,
  colors: themeTokens.dark,
  setMode: () => undefined,
  setTheme: () => undefined,
  toggleTheme: () => undefined,
  toggleMode: () => undefined,
});

interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode = 'dark' }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);

  const value = useMemo<ThemeContextValue>(() => {
    const colors = themeTokens[mode];

    return {
      mode,
      theme: mode,
      tokens: colors,
      colors,
      setMode: (nextMode: ThemeMode) => setModeState(nextMode),
      setTheme: (nextMode: ThemeMode) => setModeState(nextMode),
      toggleTheme: () => setModeState((current) => (current === 'dark' ? 'light' : 'dark')),
      toggleMode: () => setModeState((current) => (current === 'dark' ? 'light' : 'dark')),
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function useAppTheme(): ThemeContextValue {
  return useTheme();
}

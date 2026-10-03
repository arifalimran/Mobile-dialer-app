import React, { createContext, useContext, useMemo, useState } from 'react';

import { themeTokens, type AppThemeTokens, type ThemeMode } from './tokens';

interface ThemeContextValue {
  mode: ThemeMode;
  tokens: AppThemeTokens;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  tokens: themeTokens.dark,
  setMode: () => undefined,
  toggleMode: () => undefined,
});

interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode = 'dark' }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);

  const value = useMemo<ThemeContextValue>(() => {
    const tokens = themeTokens[mode];

    return {
      mode,
      tokens,
      setMode: (nextMode: ThemeMode) => setModeState(nextMode),
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

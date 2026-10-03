export const colors = {
  background: {
    slate950: '#020617',
    slate900: '#0f172a',
    slate800: '#1e293b',
  },
  accent: {
    sky: '#0284c7',
    skyLight: '#38bdf8',
    electric: '#0ea5e9',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
  },
} as const;

/**
 * 2026 "Live Slate" design tokens for the instant dark/light toggle
 * (Module 1 / Module 3). `rootClassName` is applied to the top-level
 * SafeAreaView so every screen flips together. Individual components still
 * use hard-coded Tailwind slate classes for the dark theme (unchanged,
 * pre-existing behaviour); the light theme values here are consumed by
 * newly built screens/components only, so this is purely additive and does
 * not alter any existing dark-mode UI.
 */
export const themePalettes = {
  dark: {
    background: '#070b12',
    surface: '#0f172a',
    surfaceAlt: '#1e293b',
    border: '#ffffff1a',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    rootClassName: 'bg-[#070b12]',
    surfaceClassName: 'bg-slate-900',
    borderClassName: 'border-white/10',
    textPrimaryClassName: 'text-white',
    textSecondaryClassName: 'text-slate-400',
  },
  light: {
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    rootClassName: 'bg-slate-50',
    surfaceClassName: 'bg-white',
    borderClassName: 'border-slate-200',
    textPrimaryClassName: 'text-slate-900',
    textSecondaryClassName: 'text-slate-600',
  },
} as const;

export type ThemeMode = keyof typeof themePalettes;
export type ThemePalette = (typeof themePalettes)[ThemeMode];

export type ThemeMode = 'dark' | 'light';

export interface AppThemeTokens {
  canvas: string;
  card: string;
  subpanel: string;
  background: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  brassAccent: string;
  accentSoft: string;
  accentStrong: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
}

export const themeTokens: Record<ThemeMode, AppThemeTokens> = {
  dark: {
    canvas: '#1E2025',
    card: '#282B32',
    subpanel: '#333742',
    background: '#1E2025',
    border: 'rgba(255,255,255,0.10)',
    textPrimary: '#F3F4F6',
    textSecondary: '#A2A8B5',
    accent: '#38BDF8',
    brassAccent: '#D8A243',
    accentSoft: '#E8C98A',
    accentStrong: '#A9772C',
    success: '#34D399',
    warning: '#F59E0B',
    danger: '#F87171',
    overlay: 'rgba(30, 32, 37, 0.72)',
  },
  light: {
    canvas: '#F7F3EE',
    card: '#FFFFFF',
    subpanel: '#F3E9D8',
    background: '#F2EFEA',
    border: '#D8C9AE',
    textPrimary: '#1C232D',
    textSecondary: '#5E6673',
    accent: '#0284C7',
    brassAccent: '#A97C37',
    accentSoft: '#E9D5A8',
    accentStrong: '#7E5D24',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#F43F5E',
    overlay: 'rgba(255, 255, 255, 0.78)',
  },
};

export const darkThemeTokens = themeTokens.dark;
export const lightThemeTokens = themeTokens.light;

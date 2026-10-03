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
  accentSoft: string;
  accentStrong: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
}

export const themeTokens: Record<ThemeMode, AppThemeTokens> = {
  dark: {
    canvas: '#10151C',
    card: '#151B23',
    subpanel: '#1C232D',
    background: '#0F141B',
    border: '#2A3440',
    textPrimary: '#EDEDE7',
    textSecondary: '#A4A9B2',
    accent: '#C89B4A',
    accentSoft: '#E8C98A',
    accentStrong: '#A9772C',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#F43F5E',
    overlay: 'rgba(16, 21, 28, 0.72)',
  },
  light: {
    canvas: '#F7F3EE',
    card: '#FFFFFF',
    subpanel: '#F3E9D8',
    background: '#F2EFEA',
    border: '#D8C9AE',
    textPrimary: '#1C232D',
    textSecondary: '#5E6673',
    accent: '#A97C37',
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

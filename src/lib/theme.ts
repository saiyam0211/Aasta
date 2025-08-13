import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Primary brand colors
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  // Accent colors for night delivery theme
  accent: {
    leafGreen: string;
    darkGreen: string;
    gold: string;
    cream: string;
  };
  // Semantic colors
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  // Night theme specific colors
  night: {
    bg: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
}

export const themeColors: ThemeColors = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  accent: {
    leafGreen: '#d1f86a',
    darkGreen: '#002a01',
    gold: '#ffd700',
    cream: '#fcfefe',
  },
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  night: {
    bg: '#0f0f0f',
    surface: '#1a1a1a',
    text: '#ffffff',
    textMuted: '#a1a1aa',
    border: '#27272a',
  },
};

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// CSS variables for dynamic theming
export const generateCSSVariables = (
  theme: Theme,
  systemTheme?: 'light' | 'dark'
) => {
  const isDark =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  return {
    '--color-primary-50': themeColors.primary[50],
    '--color-primary-100': themeColors.primary[100],
    '--color-primary-200': themeColors.primary[200],
    '--color-primary-300': themeColors.primary[300],
    '--color-primary-400': themeColors.primary[400],
    '--color-primary-500': themeColors.primary[500],
    '--color-primary-600': themeColors.primary[600],
    '--color-primary-700': themeColors.primary[700],
    '--color-primary-800': themeColors.primary[800],
    '--color-primary-900': themeColors.primary[900],

    '--color-accent-leaf-green': themeColors.accent.leafGreen,
    '--color-accent-dark-green': themeColors.accent.darkGreen,
    '--color-accent-gold': themeColors.accent.gold,
    '--color-accent-cream': themeColors.accent.cream,

    '--color-success': themeColors.semantic.success,
    '--color-warning': themeColors.semantic.warning,
    '--color-error': themeColors.semantic.error,
    '--color-info': themeColors.semantic.info,

    // Dynamic colors based on theme
    '--color-bg': isDark ? themeColors.night.bg : '#ffffff',
    '--color-surface': isDark ? themeColors.night.surface : '#f8fafc',
    '--color-text': isDark ? themeColors.night.text : '#1f2937',
    '--color-text-muted': isDark ? themeColors.night.textMuted : '#6b7280',
    '--color-border': isDark ? themeColors.night.border : '#e5e7eb',
  };
};

// Utility functions for theme management
export const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('theme') as Theme) || 'system';
};

export const setStoredTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('theme', theme);
};

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

export const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const systemTheme = getSystemTheme();
  const variables = generateCSSVariables(theme, systemTheme);

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Apply theme class to html element
  const isDark =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  root.classList.toggle('dark', isDark);
};

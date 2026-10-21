import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#0ea5e9', // Vibrant Sky/Cyan
    onPrimary: '#ffffff',
    primaryContainer: '#0369a1',
    onPrimaryContainer: '#e0f2fe',
    secondary: '#38bdf8',
    background: '#090d16',
    surface: '#111827',
    surfaceVariant: '#1f2937',
    onSurface: '#f3f4f6',
    onSurfaceVariant: '#9ca3af',
    outline: '#374151',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    elevation: {
      level0: 'transparent',
      level1: '#111827',
      level2: '#1a2234',
      level3: '#222d42',
      level4: '#293751',
      level5: '#314261',
    },
  },
};

export const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0284c7',
    onPrimary: '#ffffff',
    primaryContainer: '#e0f2fe',
    onPrimaryContainer: '#0369a1',
    secondary: '#0ea5e9',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceVariant: '#f1f5f9',
    onSurface: '#0f172a',
    onSurfaceVariant: '#64748b',
    outline: '#cbd5e1',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
};

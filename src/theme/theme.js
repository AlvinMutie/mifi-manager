import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

/**
 * Apple iOS Human Interface Design Token System
 * Matches iOS System Colors and Grouped Table View Styling
 */
export const iosColors = {
  blue: '#007AFF',
  blueDark: '#0A84FF',
  green: '#34C759',
  greenDark: '#30D158',
  orange: '#FF9500',
  orangeDark: '#FF9F0A',
  red: '#FF3B30',
  redDark: '#FF453A',
  purple: '#AF52DE',
  purpleDark: '#BF5AF2',
  teal: '#5AC8FA',
  tealDark: '#64D2FF',
  indigo: '#5856D6',
  indigoDark: '#5E5CE6',
  gray: '#8E8E93',
  gray2: '#AEAEB2',
  gray3: '#C7C7CC',
  gray4: '#D1D1D6',
  gray5: '#E5E5EA',
  gray6: '#F2F2F7',
};

export const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: iosColors.blueDark,
    onPrimary: '#FFFFFF',
    primaryContainer: '#1E3A8A',
    onPrimaryContainer: '#DBEAFE',
    secondary: iosColors.tealDark,
    background: '#000000', // iOS Pure Black
    surface: '#1C1C1E',    // iOS System Gray 6 Dark Card
    surfaceVariant: '#2C2C2E',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#8E8E93',
    outline: 'rgba(255, 255, 255, 0.08)',
    outlineVariant: 'rgba(255, 255, 255, 0.05)',
    success: iosColors.greenDark,
    warning: iosColors.orangeDark,
    error: iosColors.redDark,
    cardBorder: 'rgba(255, 255, 255, 0.08)',
  },
};

export const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: iosColors.blue,
    onPrimary: '#FFFFFF',
    primaryContainer: '#E0F2FE',
    onPrimaryContainer: '#0369A1',
    secondary: iosColors.teal,
    background: '#F2F2F7', // iOS System Grouped Background
    surface: '#FFFFFF',    // iOS Inset Grouped Table Cell Background
    surfaceVariant: '#E5E5EA',
    onSurface: '#000000',
    onSurfaceVariant: '#8E8E93',
    outline: '#E5E5EA',
    outlineVariant: '#E5E5EA',
    success: iosColors.green,
    warning: iosColors.orange,
    error: iosColors.red,
    cardBorder: 'rgba(0, 0, 0, 0.04)',
  },
};

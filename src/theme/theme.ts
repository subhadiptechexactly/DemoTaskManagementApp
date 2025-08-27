import { DefaultTheme } from '@react-navigation/native';

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1c7ed6',
    background: '#ffffff',
    card: '#ffffff',
    text: '#212529',
    border: '#e9ecef',
    notification: '#ff6b6b',
    
    // Custom colors
    success: '#40c057',
    warning: '#fcc419',
    danger: '#fa5252',
    info: '#15aabf',
    
    // Grayscale
    gray100: '#f8f9fa',
    gray200: '#e9ecef',
    gray300: '#dee2e6',
    gray400: '#ced4da',
    gray500: '#adb5bd',
    gray600: '#868e96',
    gray700: '#495057',
    gray800: '#343a40',
    gray900: '#212529',
    
    // Backgrounds
    backgroundPrimary: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundTertiary: '#e9ecef',
    
    // Text
    textPrimary: '#212529',
    textSecondary: '#495057',
    textTertiary: '#868e96',
    textInverse: '#ffffff',
    
    // UI Elements
    borderColor: '#e9ecef',
    separator: '#e9ecef',
    
    // Status
    online: '#40c057',
    offline: '#868e96',
    away: '#ffd43b',
    busy: '#fa5252',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 100,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: '600',
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      lineHeight: 20,
      color: '#868e96',
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#4dabf7',
    background: '#121212',
    card: '#1e1e1e',
    text: '#f8f9fa',
    border: '#343a40',
    notification: '#ff8787',
    
    // Custom colors
    success: '#69db7c',
    warning: '#ffd43b',
    danger: '#ff8787',
    info: '#66d9e8',
    
    // Grayscale
    gray100: '#212529',
    gray200: '#343a40',
    gray300: '#495057',
    gray400: '#5c5f66',
    gray500: '#6c757d',
    gray600: '#adb5bd',
    gray700: '#ced4da',
    gray800: '#e9ecef',
    gray900: '#f8f9fa',
    
    // Backgrounds
    backgroundPrimary: '#121212',
    backgroundSecondary: '#1e1e1e',
    backgroundTertiary: '#2d2d2d',
    
    // Text
    textPrimary: '#f8f9fa',
    textSecondary: '#e9ecef',
    textTertiary: '#adb5bd',
    textInverse: '#212529',
    
    // UI Elements
    borderColor: '#343a40',
    separator: '#343a40',
  },
  shadows: {
    ...lightTheme.shadows,
    sm: {
      ...lightTheme.shadows.sm,
      shadowColor: '#000',
      shadowOpacity: 0.3,
    },
    md: {
      ...lightTheme.shadows.md,
      shadowColor: '#000',
      shadowOpacity: 0.4,
    },
    lg: {
      ...lightTheme.shadows.lg,
      shadowColor: '#000',
      shadowOpacity: 0.5,
    },
  },
};

export type AppTheme = typeof lightTheme;
declare module '@react-navigation/native' {
  export function useTheme(): AppTheme;
}

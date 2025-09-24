// Ortak tema yapısı
const commonTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 10,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    xs: 11,
    sm: 13,
    md: 14,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  screen: {
  },
  layout: {
    screenHorizontalPadding: 10, // Phone default - theme.spacing.md değeri
    screenHorizontalPaddingTablet: 24, // Tablet için daha geniş - theme.spacing.lg değeri
  },
  // Global list content styles
  listContentStyle: {
    paddingBottom: 32, // theme.spacing.xl - normal sayfalar için
  },
  listContentStyleWithTabBar: {
    paddingBottom: 80, // TabBar olan sayfalar için daha fazla padding
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
      backgroundColor: '#FFFFFF', // Shadow performance fix
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
      backgroundColor: '#FFFFFF', // Shadow performance fix
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      backgroundColor: '#FFFFFF', // Shadow performance fix
    },
  },
};

// Light tema
export const lightTheme = {
  ...commonTheme,
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    surface: '#F8F8F8',
    surfaceVariant: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',
    error: '#FF3B30',
    warning: '#FF9500',
    success: '#34C759',
    info: '#4FC3F7',
    accent: '#007AFF',
    border: '#E5E5EA',
    white: '#FFFFFF',
    // Overlay colors (for images)
    overlayDark: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(255, 255, 255, 0.9)',
    textOnOverlay: '#FFFFFF',
    // Shadow color
    shadow: '#000000',
    // Danger color (alias for error)
    danger: '#FF3B30',
    // Additional colors for components
    warningBackground: 'rgba(255, 149, 0, 0.1)',
    inputBorder: '#E5E5EA',
    inputBackground: '#F8F8F8',
  },
  // Text styles with colors
  textStyles: {
    body: {
      fontSize: 15,
      color: '#000000',
    },
    bodySecondary: {
      fontSize: 15,
      color: '#8E8E93',
    },
    caption: {
      fontSize: 13,
      color: '#8E8E93',
    },
    heading: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: '#000000',
    },
    subheading: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: '#000000',
    },
  },
};

// Dark tema
export const darkTheme = {
  ...commonTheme,
  colors: {
    primary: '#3B82F6',
    secondary: '#5E5CE6',
    background: '#0A0A0A',
    surface: '#171717',
    surfaceVariant: '#262626',
    text: '#FAFAFA',
    textSecondary: '#A3A3A3',
    textTertiary: '#525252',
    error: '#DC2626',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#4FC3F7',
    accent: '#007AFF',
    border: '#262626',
    white: '#FFFFFF',
    // Overlay colors (for images)
    overlayDark: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(255, 255, 255, 0.9)',
    textOnOverlay: '#FFFFFF',
    // Shadow color
    shadow: '#000000',
    // Danger color (alias for error)
    danger: '#DC2626',
    // Additional colors for components
    warningBackground: 'rgba(245, 158, 11, 0.1)',
    inputBorder: '#262626',
    inputBackground: '#171717',
  },
  // Text styles with colors
  textStyles: {
    body: {
      fontSize: 15,
      color: '#FFFFFF',
    },
    bodySecondary: {
      fontSize: 15,
      color: '#8E8E93',
    },
    caption: {
      fontSize: 13,
      color: '#8E8E93',
    },
    heading: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: '#FFFFFF',
    },
    subheading: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: '#FFFFFF',
    },
  },
};

// Type exports
export type Theme = typeof lightTheme;
export type ThemeColors = typeof lightTheme.colors;

// Geçici olarak eski uyumluluk için
export const theme = lightTheme;
import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Tablet detection
export const isTablet = (): boolean => {
  const aspectRatio = screenHeight / screenWidth;
  const isLandscape = screenWidth > screenHeight;
  
  // iPad detection
  if (Platform.OS === 'ios') {
    // Platform.isPad is available in React Native for iPad detection
    return Platform.isPad === true || (isLandscape ? aspectRatio < 1.6 : aspectRatio < 1.75);
  }
  
  // Android tablet detection (7 inches or larger)
  const diagonal = Math.sqrt(screenWidth * screenWidth + screenHeight * screenHeight);
  return diagonal >= 700;
};

// Screen size helpers
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return {
    width,
    height,
    isLandscape: width > height,
    isPortrait: height > width,
  };
};

// Responsive sizing based on device type
export const getResponsiveSize = (phoneSize: number, tabletSize?: number): number => {
  return isTablet() && tabletSize ? tabletSize : phoneSize;
};

// Responsive font sizes
export const getFontSize = (baseSize: number): number => {
  if (isTablet()) {
    return baseSize * 1.2; // 20% larger on tablets
  }
  return baseSize;
};

// Map control button sizes
export const getMapControlSize = () => {
  if (isTablet()) {
    return {
      buttonSize: 56, // Larger buttons on tablet
      iconSize: 28,
      spacing: 16,
    };
  }
  return {
    buttonSize: 44, // Standard size on phone
    iconSize: 22,
    spacing: 12,
  };
};

// Weather info panel dimensions
export const getWeatherInfoDimensions = () => {
  if (isTablet()) {
    return {
      fontSize: 9,
      padding: 8,
      minWidth: 140,
      borderRadius: 6,
    };
  }
  return {
    fontSize: 7,
    padding: 6,
    minWidth: 100,
    borderRadius: 4,
  };
};

// Get screen padding based on device type
export const getScreenPadding = (theme: any) => {
  return isTablet() 
    ? theme.layout.screenHorizontalPaddingTablet 
    : theme.layout.screenHorizontalPadding;
};

export default {
  isTablet,
  getScreenDimensions,
  getResponsiveSize,
  getFontSize,
  getMapControlSize,
  getWeatherInfoDimensions,
  getScreenPadding,
};
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export function SpotMarker() {
  return (
    <View style={styles.container}>
      <View style={styles.markerContainer}>
        <View style={styles.markerWrapper}>
          <Svg width="24" height="33" viewBox="0 0 24 33" style={styles.pinSvg}>
            <Path
              d="M12 0C5.37258 0 0 5.37258 0 12C0 19.5 12 33 12 33C12 33 24 19.5 24 12C24 5.37258 18.6274 0 12 0Z"
              fill="#2E7D32"
            />
          </Svg>
          
          <View style={styles.logoContainer}>
            <Svg width="14" height="14" viewBox="0 0 790.82 756.58">
              <Path 
                fill="white" 
                d="M514.04,756.58h-237.25c-21.84,0-39.54-17.7-39.54-39.54s17.7-39.54,39.54-39.54h237.25c21.84,0,39.54,17.7,39.54,39.54s-17.7,39.54-39.54,39.54ZM632.66,598.42H158.16c-21.84,0-39.54-17.7-39.54-39.54s17.7-39.54,39.54-39.54h474.5c21.84,0,39.54,17.7,39.54,39.54s-17.7,39.54-39.54,39.54Z"
              />
              <Path 
                fill="white" 
                d="M751.31,440.26c-3.53,0-7.12-.48-10.69-1.48-40.51-11.35-68.48-33.71-85.52-68.34-13.62-27.67-18.02-58.7-22.69-91.54-1.02-7.16-2.07-14.57-3.22-21.95-6.69-43.12-45.98-111.91-102.4-129.06-19.39-5.9-38.95-5.13-59.8,2.34-10.15,3.64-20.46,8.84-30.89,15.58,46.61,27.55,77.94,78.32,77.94,136.27,0,87.21-70.95,158.17-158.17,158.17H39.54C17.7,440.25,0,422.55,0,400.71s17.7-39.54,39.54-39.54h316.33c43.61,0,79.08-35.48,79.08-79.08s-35.48-79.08-79.08-79.08c-15.7,0-29.91-9.29-36.21-23.66-6.3-14.38-3.51-31.12,7.12-42.67,90.53-98.31,171.24-100.18,223.01-84.44,52.11,15.85,88.11,53.19,109.12,81.73,25.13,34.13,42.78,74.52,48.41,110.82,1.23,7.87,2.33,15.56,3.38,23,9.5,66.86,15.78,84.91,51.25,94.85,21.03,5.89,33.3,27.71,27.4,48.74-4.89,17.46-20.77,28.88-38.05,28.88Z"
              />
            </Svg>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 30,
  },
  markerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerWrapper: {
    position: 'relative',
    width: 24,
    height: 30,
  },
  pinSvg: {
    position: 'absolute',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }
      : {}),
  },
  logoContainer: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
const path = require('path');

// Use ROOT node_modules only (monorepo)
const rootNodeModules = path.resolve(__dirname, '../../node_modules');

module.exports = {
  // Root dizinini belirt
  root: path.resolve(__dirname),
  
  // Proje konfigürasyonu
  project: {
    ios: {
      sourceDir: './ios',
    },
    android: {
      sourceDir: './android',
      packageName: 'com.fishivo',
    },
  },
  
  // Dependency resolver - Monorepo support with autolinking enabled
  dependencies: {
    // React Native Gesture Handler - enabled for RN 0.75 compatibility
    'react-native-gesture-handler': {
      platforms: {
        android: {
          sourceDir: path.join(rootNodeModules, 'react-native-gesture-handler/android'),
          packageImportPath: 'import com.swmansion.gesturehandler.RNGestureHandlerPackage;',
        },
      },
    },
    // React Native Vector Icons - Completely disable autolinking to prevent conflicts
    'react-native-vector-icons': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
  
  // Commands
  commands: [],
  
  // Assets
  assets: ['./assets/fonts/'],
  
  // Monorepo paths - Use ROOT node_modules
  reactNativePath: path.join(rootNodeModules, 'react-native'),
  
  // Search paths for dependencies
  watchFolders: [
    path.resolve(__dirname, '../../'),
  ],
}; 
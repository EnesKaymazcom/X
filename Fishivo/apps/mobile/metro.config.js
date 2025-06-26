const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration for TurboRepo monorepo with React Native Safe Area Context fix
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    path.resolve(__dirname, '../../packages'),
    path.resolve(__dirname, '../../node_modules'),
  ],
  resolver: {
    // ✅ Symlink desteği (TurboRepo için kritik)
    unstable_enableSymlinks: true,
    // ✅ Package exports desteği
    unstable_enablePackageExports: true,
    
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
    ],
    
    // ✅ React Native paketlerin singleton çözümü
    resolveRequest: (context, moduleName, platform) => {
      // React Native Safe Area Context'i root node_modules'ten çöz
      if (
        moduleName === 'react-native-safe-area-context' ||
        moduleName.startsWith('react-native-safe-area-context/')
      ) {
        const pathToResolve = path.resolve(
          __dirname,
          '../../node_modules',
          moduleName
        );
        return context.resolveRequest(context, pathToResolve, platform);
      }
      
      // Diğer React/React-Native paketler için singleton
      if (
        moduleName.startsWith('react') ||
        moduleName.startsWith('@react-native') ||
        moduleName.startsWith('@react-native-community') ||
        moduleName.startsWith('@fishivo')
      ) {
        const pathToResolve = path.resolve(
          __dirname,
          '../../node_modules',
          moduleName
        );
        return context.resolveRequest(context, pathToResolve, platform);
      }
      
      return context.resolveRequest(context, moduleName, platform);
    },
    
    // Add SVG support
    assetExts: ['svg', 'png', 'jpg', 'jpeg', 'gif', 'webp'],
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  },
  transformer: {
    // SVG transformer support
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

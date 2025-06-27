const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    // Projenin kök dizinini izleme listesine ekle
    path.resolve(__dirname, '../../'),
  ],
  resolver: {
    // Metro'nun projenin kök node_modules klasörünü görmesini sağla
    nodeModulesPaths: [path.resolve(__dirname, '../../node_modules')],
    // Turborepo'nun oluşturduğu sembolik linklerden kaynaklanan hataları önle
    unstable_enableSymlinks: true,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

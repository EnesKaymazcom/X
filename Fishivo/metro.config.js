const { getDefaultConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration for monorepo
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

const workspaceRoot = __dirname;
const projectRoot = path.resolve(__dirname, 'apps/native');

const config = getDefaultConfig(projectRoot);

// 1. Watch only the workspace root to prevent overlapping watches
config.watchFolders = [
  workspaceRoot
];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// Enable package exports field support
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['react-native', 'require', 'import'];

// Enable symlinks support for monorepo
config.resolver.unstable_enableSymlinks = true;

// Add source maps for better debugging
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Cache optimization for better performance and reduced Watchman recrawls
config.resetCache = true;

// 4. Add support for resolving modules from the monorepo
// Removed extraNodeModules as we're using proper exports field in package.json

// 5. Alias for React Native specific imports
config.resolver.alias = {
  // URL polyfill for React Native
  'url': 'react-native-url-polyfill/auto',
  // Block Node.js modules that are not available in React Native
  'path': false,
  'fs': false,
  'os': false,
  'crypto': false,
  'dotenv': false,
};

// 5.1. Configure platform-specific module resolution
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const fs = require('fs');
  
  // Handle @/ alias for src directory
  if (moduleName.startsWith('@/')) {
    const resolvedPath = path.join(projectRoot, 'src', moduleName.substring(2));
    // Try different extensions
    const extensions = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.js'];
    for (const ext of extensions) {
      const fullPath = resolvedPath + ext;
      if (fs.existsSync(fullPath)) {
        return {
          filePath: fullPath,
          type: 'sourceFile',
        };
      }
    }
  }
  
  // Block react-native-reanimated web modules (silent)
  if (context.originModulePath && context.originModulePath.includes('react-native-reanimated')) {
    // Block layoutReanimation/web imports
    if (moduleName.includes('layoutReanimation/web') || moduleName === '../layoutReanimation/web') {
      // Create a dummy module path
      const dummyPath = path.join(__dirname, 'node_modules', 'react-native-reanimated', 'src', 'layoutReanimation', 'index.js');
      if (fs.existsSync(dummyPath)) {
        return {
          filePath: dummyPath,
          type: 'sourceFile',
        };
      }
      return {
        filePath: path.join(__dirname, 'dummy-module.js'),
        type: 'sourceFile',
      };
    }
    
    if (moduleName.includes('.web')) {
      return {
        filePath: path.join(__dirname, 'dummy-module.js'),
        type: 'sourceFile',
      };
    }
  }
  
  // Handle relative imports in packages
  if (context.originModulePath && context.originModulePath.includes('/packages/')) {
    // Check if this is a relative import
    if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
      const basePath = path.resolve(path.dirname(context.originModulePath), moduleName);
      
      // Special handling for storage module - FORCE react-native version
      if (moduleName.includes('storage') && 
          (moduleName === './storage/index' || moduleName === '../storage/index' || 
           moduleName === './storage' || moduleName === '../storage' ||
           moduleName.endsWith('storage/index') || moduleName.endsWith('/storage'))) {
        const storageBasePath = path.resolve(path.dirname(context.originModulePath), moduleName.replace('/index', ''));
        const reactNativePath = path.join(storageBasePath, 'react-native.js');
        if (fs.existsSync(reactNativePath)) {
          return {
            filePath: reactNativePath,
            type: 'sourceFile',
          };
        }
      }
      
      // Block any import that tries to access NodeStorage or SecureTokenStorage (silent)
      if (moduleName.includes('NodeStorage') || moduleName.includes('implementations/NodeStorage')) {
        return {
          filePath: path.join(__dirname, 'dummy-module.js'), // Return dummy module
          type: 'sourceFile',
        };
      }
      
      // Block SecureTokenStorage (uses Node.js crypto module) (silent)
      if (moduleName.includes('SecureTokenStorage') || moduleName.includes('services/SecureTokenStorage')) {
        return {
          filePath: path.join(__dirname, 'dummy-module.js'), // Return dummy module
          type: 'sourceFile',
        };
      }
      
      // Block web.js file (web-specific code) (silent)
      if (moduleName.includes('web.js') || moduleName.endsWith('/web') || moduleName === 'web' || 
          moduleName.includes('.web') || moduleName.endsWith('.web.js')) {
        return {
          filePath: path.join(__dirname, 'dummy-module.js'), // Return dummy module
          type: 'sourceFile',
        };
      }
      
      // First check if it's a directory with index.js
      const indexPath = path.join(basePath, 'index.js');
      if (fs.existsSync(indexPath)) {
        return {
          filePath: indexPath,
          type: 'sourceFile',
        };
      }
      
      // Try various extensions and index files
      const possiblePaths = [
        basePath,
        `${basePath}.js`,
        `${basePath}.ts`,
        `${basePath}.react-native.js`,
        `${basePath}.native.js`,
        path.join(basePath, 'index.ts'),
        path.join(basePath, 'react-native.js'),
      ];
      
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          return {
            filePath: possiblePath,
            type: 'sourceFile',
          };
        }
      }
    }
  }
  
  // Handle @fishivo package imports
  if (moduleName.startsWith('@fishivo/')) {
    // Extract package name and subpath
    const parts = moduleName.split('/');
    const packageName = parts.slice(0, 2).join('/');
    const subPath = parts.slice(2).join('/');
    
    // Find the package directory
    const packageDir = path.resolve(workspaceRoot, 'packages', parts[1]);
    
    // UI components and contexts are now in the app, not in packages
    // Remove old @fishivo/ui handling
    
    // If importing from /react-native, use the react-native entry
    if (subPath === 'react-native') {
      const rnPath = path.join(packageDir, 'dist', 'react-native.js');
      if (fs.existsSync(rnPath)) {
        return {
          filePath: rnPath,
          type: 'sourceFile',
        };
      }
    }
    
    // Handle specific subpath imports like @fishivo/types/models
    if (subPath) {
      const distSubPath = path.join(packageDir, 'dist', subPath);
      // Try with .js extension
      const jsPath = `${distSubPath}.js`;
      if (fs.existsSync(jsPath)) {
        return {
          filePath: jsPath,
          type: 'sourceFile',
        };
      }
      // Try as directory with index.js
      const indexPath = path.join(distSubPath, 'index.js');
      if (fs.existsSync(indexPath)) {
        return {
          filePath: indexPath,
          type: 'sourceFile',
        };
      }
    }
    
    // For main package imports
    if (!subPath) {
      const distIndex = path.join(packageDir, 'dist', 'index.js');
      if (fs.existsSync(distIndex)) {
        return {
          filePath: distIndex,
          type: 'sourceFile',
        };
      }
    }
  }
  
  // Default resolution for other modules
  return context.resolveRequest(context, moduleName, platform);
};

// 5.2. Block problematic files that use Node.js modules
config.resolver.blockList = [
  // Block Node.js specific files (but not react-native versions)
  /packages\/api\/dist\/config\.web\.js$/,
  /packages\/api\/src\/config\.web\.ts$/,
  /packages\/api\/src\/web\.ts$/,
  
  // Block auth.web.js files
  /packages\/api\/dist\/services\/auth\/auth\.web\.js$/,
  /packages\/api\/src\/services\/auth\/auth\.web\.ts$/,
  
  // Block NodeStorage files completely (all extensions)
  /.*\/NodeStorage\.js$/,
  /.*\/NodeStorage\.ts$/,
  /.*\/NodeStorage\.d\.ts$/,
  
  // Block web-specific implementation files (except react-native-reanimated)
  /^(?!.*react-native-reanimated).*\.web\.js$/,
  /^(?!.*react-native-reanimated).*\.web\.ts$/,
  
  // Block react-native-reanimated web files specifically
  /react-native-reanimated\/src\/layoutReanimation\/web\/.*/,
  /react-native-reanimated\/lib\/layoutReanimation\/web\/.*/,
];

// 5. Asset extensions
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'webp', 'svg');

// 6. Source extensions - Add platform-specific extensions
config.resolver.sourceExts = ['native.tsx', 'native.ts', 'native.jsx', 'native.js', ...config.resolver.sourceExts, 'tsx', 'ts', 'jsx', 'js', 'json'];

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  assetRegistryPath: 'react-native/Libraries/Image/AssetRegistry',
  // Fix for progress indicator getting stuck at 100%
  asyncRequireModulePath: require.resolve('metro-runtime/src/modules/asyncRequire'),
};

module.exports = config;

const webpack = require('webpack');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@fishivo/api',
    '@fishivo/types', 
    '@fishivo/utils'
  ],
  experimental: {
    // esmExternals: 'loose' // Removed as per Next.js warning
    forceSwcTransforms: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'kqvhyiexevsdlhzcnhrc.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.fishivo.com',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Enable JSON imports for i18n namespaces
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });

    // Add workspace package aliases and React Native web mapping
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': 'react-native-web',
      '@fishivo/api': path.resolve(__dirname, '../../packages/api/src'),
      '@fishivo/types': path.resolve(__dirname, '../../packages/types/src'),
      '@fishivo/utils': path.resolve(__dirname, '../../packages/utils/src'),
    };

    // Ignore specific modules during bundling
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(react-native-config|react-native-image-picker|@react-native-google-signin\/google-signin|react-native-fs|@react-native-community\/geolocation|@react-native-async-storage\/async-storage)$/,
      }),
      // Ignore React Native specific files in web builds
      new webpack.IgnorePlugin({
        resourceRegExp: /\.native\.(ts|tsx|js|jsx)$/,
        contextRegExp: /@fishivo/,
      })
    );

    // Don't bundle these for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },
}

module.exports = nextConfig
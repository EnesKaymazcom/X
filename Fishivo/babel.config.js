module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./apps/native'],
        alias: {
          '@': './apps/native/src',
          '@fishivo/api': './packages/api/dist',
          '@fishivo/types': './packages/types/dist',
          '@fishivo/utils': './packages/utils/dist',
          '@fishivo/hooks': './packages/hooks/dist',
          '@fishivo/ui': './packages/ui/dist'
        }
      }
    ]
  ]
};
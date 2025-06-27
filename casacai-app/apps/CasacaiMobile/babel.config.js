module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          // Bu, @repo/database gibi importların doğru çözümlenmesini sağlar
          '@repo': '../../packages',
        },
      },
    ],
  ],
};

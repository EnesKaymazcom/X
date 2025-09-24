module.exports = {
    root: true,
    extends: '@react-native',
    rules: {
      // Gereksiz stil kurallarını kapat
      'no-trailing-spaces': 'off',
      'eol-last': 'off',
      'curly': 'off',
      'comma-dangle': 'off',
      'semi': 'off',
      'no-new': 'off',
      'radix': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-unused-vars': 'warn', // Error yerine warning
      'react-hooks/exhaustive-deps': 'warn', // Error yerine warning
      
      // TURBOREPO MONOREPO KURALLLARI
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: 'Relative imports yasaklandı! @fishivo/* veya @/ alias kullanın.'
            },
            {
              group: ['../client/*'],
              message: 'Client imports için @fishivo/api/client/* kullanın.'
            }
          ]
        }
      ],
    },
  };
  
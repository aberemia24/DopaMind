module.exports = {
  extends: [
    'universe',
    'universe/shared/typescript-analysis',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.d.ts'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
  env: {
    node: true,
    browser: true,
  },
  settings: {
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    // Reguli personalizate pentru React
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',

    // Reguli pentru hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Reguli pentru imports
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    // Reguli pentru TypeScript
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'warn',

    // Alte reguli
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};

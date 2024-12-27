import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          'vars': 'all',
          'varsIgnorePattern': '^_+$',
          'args': 'after-used',
          'argsIgnorePattern': '^_+$',
        },
      ],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'no-multiple-empty-lines': ['error', { 'max': 1 }],
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
];
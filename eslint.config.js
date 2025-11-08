import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
const ignorePatterns = [
  'node_modules/**',
  'dist/**',
  '.vscode/**',
  'components.json',
  'README.md',
  'TEMP_head.txt',
  'src/lib/PageNotFound.jsx',
  'src/utils/dashboardStats.js',
  'src/utils/index.ts',
  'index.html',
  'package.json',
  'package-lock.json',
  'jsconfig.json',
  'src/index.css',
  'postcss.config.js',
  'tailwind.config.js',
];

export default [
  {
    ignores: ignorePatterns,
  },
  {
    files: ['src/**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    ...pluginJs.configs.recommended,
  },
  {
    files: ['src/**/*.{js,mjs,cjs,jsx}'],
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    rules: {
      'no-unused-vars': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-unknown-property': ['error', { ignore: ['cmdk-input-wrapper', 'toast-close'] }],
      'react-hooks/rules-of-hooks': 'error',
    },
  },
];

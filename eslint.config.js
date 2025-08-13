import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import vitest from 'eslint-plugin-vitest'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Clean architecture rules
      'no-unused-vars': ['error', { 
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_' 
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      // Import organization rules
      'sort-imports': ['error', {
        'ignoreDeclarationSort': true,
        'ignoreMemberSort': false
      }],
    },
  },
  // Test files configuration
  {
    files: ['**/*.{test,spec}.{js,jsx}', '**/test/**/*.{js,jsx}', '**/__tests__/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...vitest.environments.env.globals,
        global: 'writable',
      },
    },
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      // Allow console.log in tests
      'no-console': 'off',
      // Relax some rules for test files
      'react-refresh/only-export-components': 'off',
    },
  },
]

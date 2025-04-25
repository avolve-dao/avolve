/**
 * ESLint configuration for Avolve platform
 * Updated: April 2025
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'next/core-web-vitals',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'jsx-a11y',
    'import',
    'react-hooks',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    // React
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js
    'react/prop-types': 'off', // We use TypeScript for type checking
    'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
    
    // TypeScript
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // Import
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    
    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'warn',
    'no-var': 'error',
    
    // Allow specific Next.js patterns
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
  },
  overrides: [
    {
      // Disable specific rules for test files
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', 'jest.setup.mjs', 'jest.config.mjs'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
    {
      // Enable specific rules for Supabase migrations
      files: ['supabase/migrations/**/*.sql'],
      rules: {
        // SQL-specific rules can be added here if needed
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'public/',
    '*.d.ts',
    'coverage/',
    '.vercel/',
    '.supabase/',
    '*.generated.ts',
  ],
};

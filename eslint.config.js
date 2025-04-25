// ESLint v9+ flat config for Next.js + TypeScript + Shadcn/ui enforcement
import js from '@eslint/js';
import next from 'eslint-config-next';

/**
 * Enforce Shadcn/ui as the only UI library.
 * Disallow forbidden UI libraries (NextUI, MUI, Chakra, etc.).
 */
const forbiddenUiLibraries = [
  '@nextui-org/react',
  'nextui',
  '@mui/material',
  'mui',
  '@chakra-ui/react',
  'chakra',
];

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  ...next(),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // Shadcn/ui enforcement: no forbidden UI libraries
      'no-restricted-imports': [
        'error',
        {
          paths: forbiddenUiLibraries.map(lib => ({
            name: lib,
            message: 'Use Shadcn/ui components from /components/ui only.',
          })),
        },
      ],
      // TypeScript strictness
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      // Code style
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
];

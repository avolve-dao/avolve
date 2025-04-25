/**
 * Jest configuration for Avolve platform
 * Configured for ESM and TypeScript support
 * Updated: April 2025
 * @type {import('jest').Config}
 */
export default {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'jest-environment-jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
    url: 'http://localhost:3000',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: 'tsconfig.jest.json',
      isolatedModules: true,
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@styles/(.*)$': '<rootDir>/styles/$1',
    '^@public/(.*)$': '<rootDir>/public/$1',
    '^@types/(.*)$': '<rootDir>/types/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    // Handle CSS imports
    '\\.module\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle static assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },
  setupFiles: [
    '<rootDir>/jest-polyfills.cjs',
    '<rootDir>/jest.dom-setup.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.mjs'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/supabase/functions/',
    '/components/',
    'tests/security/rls-policies.test.ts',
    'tests/security/middleware-security.test.ts',
    'lib/auth/auth.test.ts',
    'utils/feature-flags/feature-flags.test.ts'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(nanoid|@supabase|@testing-library)/.*)'
  ],
  testTimeout: 15000,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/supabase/functions/**',
    '!**/coverage/**',
    '!**/types/**',
    '!jest.config.mjs',
    '!jest.setup.mjs'
  ],
  coverageDirectory: 'coverage',
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)'
  ],
};

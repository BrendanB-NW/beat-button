export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/main/typescript/$1',
    '^@/components/(.*)$': '<rootDir>/src/main/typescript/components/$1',
    '^@/services/(.*)$': '<rootDir>/src/main/typescript/services/$1',
    '^@/types/(.*)$': '<rootDir>/src/main/typescript/types/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/main/typescript/hooks/$1',
    '^@/stores/(.*)$': '<rootDir>/src/main/typescript/stores/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  testMatch: [
    '<rootDir>/src/test/**/*.test.{ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/main/typescript/**/*.{ts,tsx}',
    '!src/main/typescript/**/*.d.ts',
    '!src/main/typescript/main.tsx',
    '!src/main/typescript/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
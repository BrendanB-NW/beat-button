export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/main/typescript/$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
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
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

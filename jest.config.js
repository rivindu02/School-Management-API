module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // This tells Jest to look for files in the __tests__ folder
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }]
  },
  // Run tests serially to avoid database conflicts
  maxWorkers: 1
};
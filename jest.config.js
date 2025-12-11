// jest.config.js

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // This tells Jest to look for files in the __tests__ folder
  testMatch: ['**/__tests__/**/*.test.ts'],

  // [NEW CONFIGURATION]
  // This helps Jest resolve modules imported using relative paths (like 'src/app')
  moduleDirectories: ["node_modules", "src"], 
  // [END NEW CONFIGURATION]

  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }]
  },
  // Run tests serially to avoid database conflicts
  maxWorkers: 1,
  // Increase timeout for tests
  testTimeout: 30000
};
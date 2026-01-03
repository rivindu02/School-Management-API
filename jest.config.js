// jest.config.js

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  
  // Module resolution
  moduleDirectories: ["node_modules", "src"],
  
  // Transform configuration
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }]
  },
  
  // Test environment setup
  maxWorkers: 1,
  testTimeout: 30000,
  
  // Handle async operations
  detectOpenHandles: true,
  forceExit: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Ignore node_modules except for ES modules that need transformation
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ]
};
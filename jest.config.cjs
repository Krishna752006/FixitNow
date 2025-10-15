module.exports = {
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/LocationPicker$': '<rootDir>/src/__mocks__/LocationPicker.tsx'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js', '@testing-library/jest-dom'],
  testEnvironment: 'jsdom',
};
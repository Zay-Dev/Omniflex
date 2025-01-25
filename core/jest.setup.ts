/**
 * Jest setup file for @omniflex/core workspace
 * This setup provides core test utilities and mock cleanup
 */

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Reset all mocks after each test
afterEach(() => {
  jest.resetAllMocks();
});

// Test utilities for creating test data
export const createTestError = (message: string, code = 500) => ({
  message,
  code,
  error: undefined,
});

// Mock external dependencies
export const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// Export test utilities
export const TestUtils = {
  createTestError,
  mockLogger,
};
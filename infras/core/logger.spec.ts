import '.';
import { ILogger } from '@omni-infra/types/logger';

describe('Core/Logger', () => {
  let originalLogger: ILogger;
  let mockLogger: ILogger;

  beforeEach(() => {
    originalLogger = globalThis.logger;

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      verbose: jest.fn(),
      silly: jest.fn(),
    };

    globalThis.logger = mockLogger;
  });

  afterEach(() => {
    globalThis.logger = originalLogger;
  });

  it('[Core/Logger-0010] should make logger available globally', () => {
    expect(globalThis.logger).toBeDefined();
  });

  it('[Core/Logger-0020] should make getThrowable available globally', () => {
    expect(globalThis.getThrowable).toBeDefined();
    expect(typeof globalThis.getThrowable).toBe('function');
  });

  it('[Core/Logger-0030] getThrowable should log error and return Error instance', () => {
    const error = getThrowable('Test error message');

    expect(mockLogger.error).toHaveBeenCalledWith('Test error message');
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error message');
  });
});
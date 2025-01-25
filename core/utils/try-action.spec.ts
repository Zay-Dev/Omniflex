import { tryAction } from './try-action';
import { mockLogger } from '../jest.setup';
import { ILogger } from '../types/logger';

describe('tryAction', () => {
  it('[CORE-C0010] should execute successful action', async () => {
    // Arrange
    const expectedResult = 'success';
    const action = async () => expectedResult;

    // Act
    const result = await tryAction(action);

    // Assert
    expect(result).toBe(expectedResult);
  });

  it('[CORE-C0020] should handle error with default next', async () => {
    // Arrange
    const error = new Error('test error');
    const action = async () => { throw error; };

    // Act & Assert
    await expect(tryAction(action)).rejects.toThrow(error);
  });

  it('[CORE-C0030] should handle error with custom next', async () => {
    // Arrange
    const error = new Error('test error');
    const action = async () => { throw error; };
    const next = jest.fn().mockReturnValue('error handled');

    // Act
    const result = await tryAction(action, { next });

    // Assert
    expect(next).toHaveBeenCalledWith(error);
    expect(result).toBe('error handled');
  });

  it('[CORE-C0040] should log to console when streamErrorToConsole is true', async () => {
    // Arrange
    const error = new Error('test error');
    const action = async () => { throw error; };
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const next = jest.fn();

    // Act
    await tryAction(action, { next, streamErrorToConsole: true });

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith(error);
    consoleSpy.mockRestore();
  });

  it('[CORE-C0050] should use custom logger for error logging', async () => {
    // Arrange
    const error = new Error('test error');
    const action = async () => { throw error; };
    const logger: ILogger = {
      ...mockLogger,
      verbose: jest.fn(),
      silly: jest.fn(),
      error: jest.fn()
    };
    const next = jest.fn();

    // Act
    await tryAction(action, { next, logger });

    // Assert
    expect(logger.error).toHaveBeenCalledWith({ error });
  });
}); 
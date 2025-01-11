import { createLogger } from './console-logger';
import { ILogger, TOptions } from '../types/logger';

describe('Console Logger', () => {
  let logger: ILogger;
  let consoleSpy: {
    error: jest.SpyInstance;
    warn: jest.SpyInstance;
    info: jest.SpyInstance;
    debug: jest.SpyInstance;
    log: jest.SpyInstance;
  };

  beforeEach(() => {
    // Create spies for all console methods
    consoleSpy = {
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      log: jest.spyOn(console, 'log').mockImplementation(),
    };
    logger = createLogger();
  });

  afterEach(() => {
    // Restore all spies
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('createLogger', () => {
    it('[LOGGER-C0010] should create logger with all required methods', () => {
      // Assert
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.debug).toBeDefined();
      expect(logger.verbose).toBeDefined();
      expect(logger.silly).toBeDefined();
    });
  });

  describe('error', () => {
    it('[LOGGER-L0010] should log error with message', () => {
      // Arrange
      const message = 'test error';

      // Act
      logger.error(message);

      // Assert
      expect(consoleSpy.error).toHaveBeenCalledWith(message);
    });

    it('[LOGGER-L0020] should log error with options', () => {
      // Arrange
      const options: TOptions = {
        error: new Error('test error'),
        data: { foo: 'bar' },
        tags: ['test'],
      };

      // Act
      logger.error(options);

      // Assert
      expect(consoleSpy.error).toHaveBeenCalledWith(options);
    });

    it('[LOGGER-L0030] should log error with message and options', () => {
      // Arrange
      const message = 'test error';
      const options: TOptions = {
        error: new Error('test error'),
        data: { foo: 'bar' },
        tags: ['test'],
      };

      // Act
      logger.error(message, options);

      // Assert
      expect(consoleSpy.error).toHaveBeenCalledWith(message, options);
    });
  });

  describe('warn', () => {
    it('[LOGGER-L0040] should log warning with message', () => {
      // Arrange
      const message = 'test warning';

      // Act
      logger.warn(message);

      // Assert
      expect(consoleSpy.warn).toHaveBeenCalledWith(message);
    });

    it('[LOGGER-L0050] should log warning with options', () => {
      // Arrange
      const options: TOptions = {
        data: { foo: 'bar' },
        tags: 'test',
      };

      // Act
      logger.warn(options);

      // Assert
      expect(consoleSpy.warn).toHaveBeenCalledWith(options);
    });
  });

  describe('info', () => {
    it('[LOGGER-L0060] should log info with message', () => {
      // Arrange
      const message = 'test info';

      // Act
      logger.info(message);

      // Assert
      expect(consoleSpy.info).toHaveBeenCalledWith(message);
    });

    it('[LOGGER-L0070] should log info with options', () => {
      // Arrange
      const options: TOptions = {
        data: { foo: 'bar' },
        tags: ['test1', 'test2'],
      };

      // Act
      logger.info(options);

      // Assert
      expect(consoleSpy.info).toHaveBeenCalledWith(options);
    });
  });

  describe('debug', () => {
    it('[LOGGER-L0080] should log debug with message', () => {
      // Arrange
      const message = 'test debug';

      // Act
      logger.debug(message);

      // Assert
      expect(consoleSpy.debug).toHaveBeenCalledWith(message);
    });

    it('[LOGGER-L0090] should log debug with options', () => {
      // Arrange
      const options: TOptions = {
        data: { foo: 'bar' },
      };

      // Act
      logger.debug(options);

      // Assert
      expect(consoleSpy.debug).toHaveBeenCalledWith(options);
    });
  });

  describe('verbose', () => {
    it('[LOGGER-L0100] should log verbose using debug with message', () => {
      // Arrange
      const message = 'test verbose';

      // Act
      logger.verbose(message);

      // Assert
      expect(consoleSpy.debug).toHaveBeenCalledWith(message);
    });

    it('[LOGGER-L0110] should log verbose using debug with options', () => {
      // Arrange
      const options: TOptions = {
        data: { foo: 'bar' },
      };

      // Act
      logger.verbose(options);

      // Assert
      expect(consoleSpy.debug).toHaveBeenCalledWith(options);
    });
  });

  describe('silly', () => {
    it('[LOGGER-L0120] should log silly using log with message', () => {
      // Arrange
      const message = 'test silly';

      // Act
      logger.silly(message);

      // Assert
      expect(consoleSpy.log).toHaveBeenCalledWith(message);
    });

    it('[LOGGER-L0130] should log silly using log with options', () => {
      // Arrange
      const options: TOptions = {
        data: { foo: 'bar' },
      };

      // Act
      logger.silly(options);

      // Assert
      expect(consoleSpy.log).toHaveBeenCalledWith(options);
    });
  });
});
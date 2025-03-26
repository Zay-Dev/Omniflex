import { Logger } from 'winston';
import { WinstonLogger } from './winston-logger';
import { Level, TOptions } from '@omni-infra/types/logger';

describe('WinstonLogger', () => {
  const error = { name: "Error", stack: "errorStack" } as Error;

  let mockWinstonLogger: Logger;
  let winstonLogger: WinstonLogger;

  beforeEach(() => {
    mockWinstonLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      silly: jest.fn(),
    } as unknown as Logger;

    winstonLogger = new WinstonLogger(mockWinstonLogger);
  });

  const logLevels: Level[] = ['error', 'warn', 'info', 'debug', 'verbose', 'silly'];

  logLevels.forEach(level => {
    describe(`${level} method`, () => {
      it(`[Logger/Winston-00${logLevels.indexOf(level) + 10}] should log string message with ${level} level`, () => {
        const message = 'Test message';

        winstonLogger[level](message);

        expect(mockWinstonLogger[level]).toHaveBeenCalledWith(message);
      });

      it(`[Logger/Winston-00${logLevels.indexOf(level) + 20}] should log with options when provided as first parameter`, () => {
        const options: TOptions = {
          error,
          data: { test: 'data' },
          tags: ['tag1', 'tag2']
        };

        winstonLogger[level](options);

        expect(mockWinstonLogger[level]).toHaveBeenCalledWith(`[tag1] [tag2] {"test":"data"} ${options.error!.stack}`);
      });

      it(`[Logger/Winston-00${logLevels.indexOf(level) + 30}] should log message with options when both provided`, () => {
        const message = 'Test message';
        const options: TOptions = {
          data: { test: 'data' },
          tags: 'test-tag'
        };

        winstonLogger[level](message, options);

        expect(mockWinstonLogger[level]).toHaveBeenCalledWith('[test-tag] Test message {"test":"data"}');
      });
    });
  });

  describe('_tagsToPrefix method', () => {
    it('[Logger/Winston-0100] should return empty string for undefined tags', () => {
      const result = (winstonLogger as any)._tagsToPrefix(undefined);
      expect(result).toBe('');
    });

    it('[Logger/Winston-0110] should format single string tag correctly', () => {
      const result = (winstonLogger as any)._tagsToPrefix('test-tag');
      expect(result).toBe('[test-tag]');
    });

    it('[Logger/Winston-0120] should format array of tags correctly', () => {
      const result = (winstonLogger as any)._tagsToPrefix(['tag1', 'tag2']);
      expect(result).toBe('[tag1] [tag2]');
    });
  });
});
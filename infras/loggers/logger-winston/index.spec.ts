import * as winston from 'winston';
import * as Transport from 'winston-transport';

import { createLogger, transports } from './index';

jest.mock('winston', () => {
  const originalModule = jest.requireActual('winston');
  return {
    ...originalModule,
    createLogger: jest.fn().mockImplementation(() => ({
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      silly: jest.fn(),
    })),
    format: {
      ...originalModule.format,
      combine: jest.fn(),
      timestamp: jest.fn(),
      printf: jest.fn().mockImplementation(formatter => formatter),
      colorize: jest.fn(),
    },
    transports: {
      Console: jest.fn().mockImplementation(() => ({})),
    },
  };
});

describe('Logger/Winston', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('[Logger/Winston-0220] should create logger with custom transports', () => {
    const customTransport = {} as Transport;
    createLogger({ transports: [customTransport] });

    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        transports: [customTransport, expect.any(Object)],
      })
    );
  });

  it('[Logger/Winston-0230] should create logger without console transport when noConsole is true', () => {
    createLogger({ noConsole: true });

    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        transports: [],
      })
    );
  });

  it('[Logger/Winston-0240] should export winston transports', () => {
    expect(transports).toBe(winston.transports);
  });

  it('[Logger/Winston-0250] should return ILogger instance', () => {
    const logger = createLogger();
    expect(logger).toHaveProperty('error');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('debug');
    expect(logger).toHaveProperty('verbose');
    expect(logger).toHaveProperty('silly');
  });
});
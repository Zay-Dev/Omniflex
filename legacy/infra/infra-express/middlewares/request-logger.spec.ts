import { Request, Response, NextFunction } from 'express';
import { logger } from '@omniflex/core';
import { requestLogger } from './request-logger';
import morgan from 'morgan';
import { ProcessedRequest } from '@omniflex/infra-express/utils/request-processor';

// Define types for mocks
type TMorganFunction = jest.Mock<string, [string, any]> & {
  token: jest.Mock<void, [string, (req: Request, res: Response) => string]>;
};

// Create mock factory
function createMockMorgan(): TMorganFunction {
  const mock = jest.fn() as TMorganFunction;
  mock.token = jest.fn();
  return mock;
}

// Mock dependencies
jest.mock('morgan', () => createMockMorgan());

jest.mock('@omniflex/core', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@omniflex/infra-express/utils/request-processor', () => ({
  processRequest: jest.fn((req: Request) => ({
    path: req.path,
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body,
  })),
}));

describe('requestLogger', () => {
  let mockReq: Partial<Request>;
  let mockRes: Response;
  let mockNext: jest.Mock;
  let mockMorgan: TMorganFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMorgan = require('morgan');
    mockReq = {
      path: '/test',
      method: 'GET',
      headers: {},
      query: {},
      body: {},
    };
    mockRes = {
      locals: {},
      on: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    mockNext = jest.fn();
  });

  describe('captureRequest', () => {
    it('[EXPR-L0010] should capture request details in res.locals', () => {
      const middleware = requestLogger();
      const [captureRequest] = middleware;

      captureRequest(mockReq as Request, mockRes, mockNext);

      expect(mockRes.locals).toEqual({
        __processedRequest: {
          path: '/test',
          method: 'GET',
          headers: {},
          query: {},
          body: {},
        },
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('createLogger', () => {
    it('[EXPR-L0020] should create morgan logger with correct format', () => {
      const middleware = requestLogger();
      const [, morganMiddleware] = middleware;

      expect(mockMorgan).toHaveBeenCalledWith(
        ':processed-request\nResponse: :status :response-time ms',
        expect.any(Object)
      );
    });

    it('[EXPR-L0030] should log suspicious paths with warn level', () => {
      const suspiciousReq = {
        ...mockReq,
        path: '/.env',
      };
      mockRes.locals = {
        __processedRequest: {
          path: '/.env',
          method: 'GET',
        } as ProcessedRequest,
      };

      const middleware = requestLogger();
      const [, morganMiddleware] = middleware;

      // Simulate morgan stream write
      const stream = (mockMorgan.mock.calls[0][1] as any).stream;
      stream.write('path": "/.env"\nResponse: 200');

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('/.env'));
    });

    it('[EXPR-L0040] should not log health check paths', () => {
      const healthReq = {
        ...mockReq,
        path: '/health/',
      };
      mockRes.locals = {
        __processedRequest: {
          path: '/health/',
          method: 'GET',
        } as ProcessedRequest,
      };

      const middleware = requestLogger();
      const [, morganMiddleware] = middleware;

      // Check skip function
      const skip = (mockMorgan.mock.calls[0][1] as any).skip;
      expect(skip(healthReq, mockRes)).toBe(true);

      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.debug).not.toHaveBeenCalled();
    });

    it('[EXPR-L0050] should handle error responses', () => {
      const testError = new Error('Test error');
      mockRes.locals = {
        __processedRequest: {
          path: '/test',
          method: 'GET',
        } as ProcessedRequest,
        error: testError,
      };

      const middleware = requestLogger();
      const [, morganMiddleware] = middleware;

      // Simulate morgan stream write with error
      const stream = (mockMorgan.mock.calls[0][1] as any).stream;
      const message = [
        'path": "/test"',
        'Error": {',
        `  "name": "${testError.name}"`,
        `  "message": "${testError.message}"`,
        `  "stack": "${testError.stack}"`,
        '}',
        'Response: 500'
      ].join('\n');
      stream.write(message);

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error'));
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Test error'));
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining(testError.stack || ''));
    });
  });
}); 
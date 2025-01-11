import { Request, Response, NextFunction } from 'express';
import { Containers } from '@omniflex/core';
import { BaseError } from '@omniflex/core/types/error';
import { errorHandler } from './error-handler';
import { TInfraExpressLocals } from '../internal-types';
import { TestUtils, errors } from '../test-utils';

interface IErrorResponse {
  code: number;
  status: number;
  message: string;
  error: string;
  errorCode?: string;
  data?: unknown;
  appType?: string;
  requestId?: string;
  path?: string;
  method?: string;
  timestamp: string;
}

// Mock dependencies
jest.mock('@omniflex/core', () => ({
  Containers: {
    configAs: jest.fn(),
  },
}));

describe('error-handler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Response<IErrorResponse, TInfraExpressLocals>;
  let mockNext: NextFunction;
  let mockConfig: { logging: { exposeErrorDetails: boolean } };

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = TestUtils.createMockRequest({
      path: '/test',
      method: 'GET',
    });

    mockRes = TestUtils.createMockResponse() as Response<IErrorResponse, TInfraExpressLocals>;
    mockNext = TestUtils.createMockNext();

    mockConfig = {
      logging: {
        exposeErrorDetails: false,
      },
    };

    (Containers.configAs as jest.Mock).mockReturnValue(mockConfig);
  });

  describe('errorHandler', () => {
    it('[MDWR-E0010] should handle BaseError with status code', () => {
      const error = errors.custom('Test error', 400, {
        errorCode: 'TEST_ERROR',
        data: { test: true },
      });

      errorHandler(error, mockReq as Request, mockRes, mockNext);

      expect(mockRes.locals.error).toBe(error);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 400,
        status: 400,
        message: 'Test error',
        errorCode: 'TEST_ERROR',
        error: 'BaseError',
        appType: 'test',
        requestId: 'test-request-id',
        path: '/test',
        method: 'GET',
      }));
    });

    it('[MDWR-E0020] should handle BaseError without explicit status code', () => {
      const error = errors.custom('Test error', 500);

      errorHandler(error, mockReq as Request, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 500,
        status: 500,
        message: 'Test error',
        error: 'BaseError',
      }));
    });

    it('[MDWR-E0030] should expose error data when configured', () => {
      mockConfig.logging.exposeErrorDetails = true;

      const error = errors.custom('Test error', 500, {
        data: { test: true },
      });

      errorHandler(error, mockReq as Request, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        data: { test: true },
      }));
    });

    it('[MDWR-E0040] should handle general Error', () => {
      const error = new Error('Test error');
      error.name = 'TestError';

      errorHandler(error, mockReq as Request, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 500,
        status: 500,
        message: 'Test error',
        error: 'TestError',
      }));
    });

    it('[MDWR-E0050] should handle error with custom code', () => {
      const error = errors.custom('Test error', 418);

      errorHandler(error, mockReq as Request, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(418);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 418,
        status: 418,
      }));
    });

    it('[MDWR-E0060] should handle error with custom errorCode', () => {
      const error = errors.custom('Test error', 500, {
        errorCode: 'TEAPOT',
      });

      errorHandler(error, mockReq as Request, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        errorCode: 'TEAPOT',
      }));
    });

    it('[MDWR-E0070] should handle error with nested error', () => {
      const error = new Error('Test error');
      error.name = 'TestError';
      (error as any).error = new Error('Nested error');

      const mockDate = new Date('2025-01-11T15:12:02.919Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      errorHandler(error, mockReq as Request, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        code: 500,
        status: 500,
        message: 'Test error',
        error: (error as any).error,
        errorCode: undefined,
        appType: 'test',
        requestId: 'test-request-id',
        path: '/test',
        method: 'GET',
        timestamp: '2025-01-11T15:12:02.919Z',
      });

      jest.restoreAllMocks();
    });

    it('[MDWR-E0080] should handle unknown path and method', () => {
      const error = errors.custom('Test error');
      const reqWithoutPath = TestUtils.createMockRequest();

      errorHandler(error, reqWithoutPath, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        path: 'Unknown path',
        method: 'Unknown method',
      }));
    });

    it('[MDWR-E0090] should include timestamp in response', () => {
      const error = errors.custom('Test error');
      const mockDate = new Date('2024-01-01T00:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      errorHandler(error, mockReq as Request, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        timestamp: '2024-01-01T00:00:00.000Z',
      }));

      jest.restoreAllMocks();
    });
  });
}); 
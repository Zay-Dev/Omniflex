import '@omni-infra/core';
import { NextFunction } from 'express';
import { getDefaultErrorHandler, jsonifityError } from './default-error-handler';
import { TOmniRequest, TOmniResponse } from '../types';

describe('Express/Middlewares/DefaultErrorHandler', () => {
  describe('getDefaultErrorHandler', () => {
    let mockReq: TOmniRequest;
    let mockRes: TOmniResponse;
    let mockNext: NextFunction;
    let mockJsonFn: jest.Mock;
    let mockStatusFn: jest.Mock;

    beforeEach(() => {
      mockJsonFn = jest.fn();
      mockStatusFn = jest.fn().mockReturnValue({ json: mockJsonFn });

      mockReq = {
        path: '/test-path',
        method: 'GET',
        _requestId: 'test-request-id',
        _serverType: 'test-server',
      } as TOmniRequest;

      mockRes = {
        status: mockStatusFn,
      } as unknown as TOmniResponse;

      mockNext = jest.fn();
    });

    it('[Express/Middlewares/DefaultErrorHandler-0010] should set error status code and return JSON response', () => {
      const handler = getDefaultErrorHandler();
      const error = new Error('Test error');

      handler(error, mockReq, mockRes, mockNext);

      expect(mockStatusFn).toHaveBeenCalledWith(500);
      expect(mockJsonFn).toHaveBeenCalled();
      expect(mockRes._error).toBe(error);
    });

    it('[Express/Middlewares/DefaultErrorHandler-0020] should use ServerError code if available', () => {
      const handler = getDefaultErrorHandler();
      const error = new errors.ServerError({
        code: 400,
        message: 'Bad request',
      });

      handler(error, mockReq, mockRes, mockNext);

      expect(mockStatusFn).toHaveBeenCalledWith(400);
      expect(mockJsonFn).toHaveBeenCalled();
      expect(mockRes._error).toBe(error);
    });

    it('[Express/Middlewares/DefaultErrorHandler-0030] should hide stack trace when hideStack is true', () => {
      const handler = getDefaultErrorHandler(true);
      const error = new Error('Test error');

      handler(error, mockReq, mockRes, mockNext);

      expect(mockJsonFn).toHaveBeenCalled();
      const response = mockJsonFn.mock.calls[0][0];

      expect(response).not.toHaveProperty('error', error.stack);
    });
  });

  describe('jsonifityError', () => {
    let mockReq: TOmniRequest;

    beforeEach(() => {
      mockReq = {
        path: '/test-path',
        method: 'GET',
        _requestId: 'test-request-id',
        _serverType: 'test-server',
      } as TOmniRequest;
    });

    it('[Express/Middlewares/DefaultErrorHandler-0040] should include basic response data', () => {
      const error = new Error('Test error');
      const jsonError = jsonifityError(error, mockReq);

      expect(jsonError).toHaveProperty('message', 'Test error');
      expect(jsonError).toHaveProperty('status', 500);
      expect(jsonError).toHaveProperty('code', 500);
      expect(jsonError).toHaveProperty('requestId', 'test-request-id');
      expect(jsonError).toHaveProperty('serverType', 'test-server');
      expect(jsonError).toHaveProperty('path', '/test-path');
      expect(jsonError).toHaveProperty('method', 'GET');
      expect(jsonError).toHaveProperty('timestamp');
    });

    it('[Express/Middlewares/DefaultErrorHandler-0050] should include stack trace for regular errors', () => {
      const error = new Error('Test error');
      const jsonError = jsonifityError(error, mockReq);

      expect(jsonError).toHaveProperty('error', error.stack);
    });

    it('[Express/Middlewares/DefaultErrorHandler-0060] should hide stack trace when hideStack is true', () => {
      const error = new Error('Test error');
      const jsonError = jsonifityError(error, mockReq, true);

      expect(jsonError).not.toHaveProperty('error', error.stack);
      expect(jsonError).toHaveProperty('error', 'Error');
    });

    it('[Express/Middlewares/DefaultErrorHandler-0070] should include ServerError data', () => {
      const error = new errors.ServerError({
        code: 400,
        message: 'Bad request',
        error: 'VALIDATION_ERROR',
        errorCode: 'FIELD_INVALID',
        data: { field: 'username' },
      });

      const jsonError = jsonifityError(error, mockReq);

      expect(jsonError).toHaveProperty('status', 400);
      expect(jsonError).toHaveProperty('code', 400);
      expect(jsonError).toHaveProperty('message', 'Bad request');
      expect(jsonError).toHaveProperty('error', 'VALIDATION_ERROR');
      expect(jsonError).toHaveProperty('errorCode', 'FIELD_INVALID');
      expect(jsonError).toHaveProperty('data', { field: 'username' });
    });

    it('[Express/Middlewares/DefaultErrorHandler-0080] should hide ServerError data when hideStack is true', () => {
      const error = new errors.ServerError({
        code: 400,
        message: 'Bad request',
        error: 'VALIDATION_ERROR',
        errorCode: 'FIELD_INVALID',
        data: { field: 'username' },
      });

      const jsonError = jsonifityError(error, mockReq, true);

      expect(jsonError).toHaveProperty('status', 400);
      expect(jsonError).toHaveProperty('code', 400);
      expect(jsonError).toHaveProperty('message', 'Bad request');
      expect(jsonError).toHaveProperty('error', 'VALIDATION_ERROR');
      expect(jsonError).toHaveProperty('errorCode', 'FIELD_INVALID');
      expect(jsonError).not.toHaveProperty('data');
    });

    it('[Express/Middlewares/DefaultErrorHandler-0090] should handle errors with numeric code property', () => {
      const error = new Error('Test error') as any;
      error.code = 403;

      const jsonError = jsonifityError(error, mockReq);

      expect(jsonError).toHaveProperty('status', 403);
      expect(jsonError).toHaveProperty('code', 403);
    });

    it('[Express/Middlewares/DefaultErrorHandler-0100] should default to 500 for non-numeric error codes', () => {
      const error = new Error('Test error') as any;
      error.code = 'ERR_CONNECTION';

      const jsonError = jsonifityError(error, mockReq);

      expect(jsonError).toHaveProperty('status', 500);
      expect(jsonError).toHaveProperty('code', 500);
    });
  });
});
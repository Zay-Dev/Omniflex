import '@omni-infra/core';
import { Request, Response, NextFunction } from 'express';
import { createHandler, createHandlerWithTry } from './create-handler';

describe('Express/Middlewares/CreateHandler', () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: { test: 'value' },
    } as Request;

    mockRes = {} as Response;
    mockNext = jest.fn();
  });

  describe('createHandler', () => {
    it('[Express/Middlewares/CreateHandler-0010] should create middleware that calls callback with express params', () => {
      const callback = jest.fn();
      const middleware = createHandler(callback);

      middleware(mockReq, mockRes, mockNext);

      expect(callback).toHaveBeenCalled();
      const callbackArg = callback.mock.calls[0][0];

      expect(callbackArg.req).toBe(mockReq);
      expect(callbackArg.res).toBe(mockRes);
      expect(callbackArg.next).toBe(mockNext);
    });

    it('[Express/Middlewares/CreateHandler-0020] should provide try method in callback params', () => {
      let capturedParams: any;
      const middleware = createHandler(params => {
        capturedParams = params;
      });

      middleware(mockReq, mockRes, mockNext);

      expect(capturedParams.try).toBeDefined();
      expect(typeof capturedParams.try).toBe('function');
    });

    it('[Express/Middlewares/CreateHandler-0030] should provide tryWithBody method in callback params', () => {
      let capturedParams: any;
      const middleware = createHandler(params => {
        capturedParams = params;
      });

      middleware(mockReq, mockRes, mockNext);

      expect(capturedParams.tryWithBody).toBeDefined();
      expect(typeof capturedParams.tryWithBody).toBe('function');
    });
  });

  describe('try method', () => {
    it('[Express/Middlewares/CreateHandler-0040] should execute callback and return result', async () => {
      let capturedParams: any;
      const middleware = createHandler(params => {
        capturedParams = params;
      });

      middleware(mockReq, mockRes, mockNext);

      const result = await capturedParams.try(() => 'success');

      expect(result).toBe('success');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('[Express/Middlewares/CreateHandler-0050] should catch error and call next with error', async () => {
      let capturedParams: any;
      const middleware = createHandler(params => {
        capturedParams = params;
      });

      middleware(mockReq, mockRes, mockNext);

      const error = new Error('Test error');
      const result = await capturedParams.try(() => {
        throw error;
      });

      expect(result).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('[Express/Middlewares/CreateHandler-0060] should use custom onError handler if provided', async () => {
      let capturedParams: any;
      const middleware = createHandler(params => {
        capturedParams = params;
      });

      middleware(mockReq, mockRes, mockNext);

      const customError = new Error('Custom error');
      const onError = jest.fn().mockReturnValue(customError);

      const result = await capturedParams.try(() => {
        throw new Error('Original error');
      }, { onError });

      expect(result).toBeUndefined();
      expect(onError).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(customError);
    });
  });

  describe('tryWithBody method', () => {
    it('[Express/Middlewares/CreateHandler-0070] should execute callback with request body', async () => {
      let capturedParams: any;
      const middleware = createHandler(params => {
        capturedParams = params;
      });

      middleware(mockReq, mockRes, mockNext);

      const callback = jest.fn().mockReturnValue('success');
      const result = await capturedParams.tryWithBody(callback);

      expect(result).toBe('success');
      expect(callback).toHaveBeenCalledWith(mockReq.body);
    });

    it('[Express/Middlewares/CreateHandler-0080] should catch error and call next with error', async () => {
      let capturedParams: any;
      const middleware = createHandler(params => {
        capturedParams = params;
      });

      middleware(mockReq, mockRes, mockNext);

      const error = new Error('Test error');
      const result = await capturedParams.tryWithBody(() => {
        throw error;
      });

      expect(result).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createHandlerWithTry', () => {
    it('[Express/Middlewares/CreateHandler-0090] should create middleware that automatically wraps callback in try', async () => {
      const callback = jest.fn().mockResolvedValue('success');
      const middleware = createHandlerWithTry(callback);

      await middleware(mockReq, mockRes, mockNext);

      expect(callback).toHaveBeenCalled();
      const callbackArg = callback.mock.calls[0][0];

      expect(callbackArg.req).toBe(mockReq);
      expect(callbackArg.res).toBe(mockRes);
      expect(callbackArg.next).toBe(mockNext);
    });

    it('[Express/Middlewares/CreateHandler-0100] should catch errors in callback and pass to next', async () => {
      const error = new Error('Test error');
      const callback = jest.fn().mockRejectedValue(error);

      const middleware = createHandlerWithTry(callback);

      await middleware(mockReq, mockRes, mockNext);

      expect(callback).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
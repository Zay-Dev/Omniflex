import '@omni-infra/core';
import { Request, Response } from 'express';
import { defaultBearerToken, useUser, ACCESS_TOKEN_TYPE } from './default-bearer-token';
import * as CreateHandler from './create-handler';
import { TExpressParams } from '../types';

jest.mock('./create-handler', () => ({
  createHandler: jest.fn().mockImplementation(
    (callback: (express: TExpressParams) => any) => {
      return async (req, res, next) => {
        await callback({ req, res, next });
      };
    }
  ),
}));

describe('Express/Middlewares/DefaultBearerToken', () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: jest.Mock;
  let mockLoggerError: jest.SpyInstance;

  beforeEach(() => {
    mockReq = {
      headers: {},
    } as Request;

    mockRes = {
      locals: {},
    } as Response;

    mockNext = jest.fn();
    mockLoggerError = jest.spyOn(globalThis.logger, 'error').mockImplementation();
  });

  afterEach(() => {
    mockLoggerError.mockRestore();
  });

  describe('defaultBearerToken', () => {
    it('[Express/Middlewares/DefaultBearerToken-0010] should call createHandler', () => {
      const verify = jest.fn();

      defaultBearerToken({ verify });

      expect(CreateHandler.createHandler).toHaveBeenCalled();
    });

    it('[Express/Middlewares/DefaultBearerToken-0020] should call next with unauthorized when no token', async () => {
      const verify = jest.fn();
      const middleware = defaultBearerToken({ verify });

      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(errors.ServerError);
      expect(mockNext.mock.calls[0][0].code).toBe(401);
    });

    it('[Express/Middlewares/DefaultBearerToken-0030] should call next when optional and no token', async () => {
      const verify = jest.fn();
      const middleware = defaultBearerToken({
        verify,
        optional: true,
      });

      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('[Express/Middlewares/DefaultBearerToken-0040] should extract token from authorization header', async () => {
      const user = {
        __tokenType: ACCESS_TOKEN_TYPE,
        __identifier: 'test-user',
      };

      const verify = jest.fn().mockResolvedValue(user);
      const middleware = defaultBearerToken({ verify });

      mockReq.headers.authorization = 'Bearer test-token';

      await middleware(mockReq, mockRes, mockNext);

      expect(verify).toHaveBeenCalledWith('test-token');
    });

    it('[Express/Middlewares/DefaultBearerToken-0050] should set user on res.locals when valid', async () => {
      const user = {
        __tokenType: ACCESS_TOKEN_TYPE,
        __identifier: 'test-user',
      };

      const verify = jest.fn().mockResolvedValue(user);
      const middleware = defaultBearerToken({ verify });

      mockReq.headers.authorization = 'Bearer test-token';

      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.locals.user).toBe(user);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('[Express/Middlewares/DefaultBearerToken-0060] should reject when token type does not match', async () => {
      const user = {
        __tokenType: 'refresh-token',
        __identifier: 'test-user',
      };

      const verify = jest.fn().mockResolvedValue(user);
      const middleware = defaultBearerToken({ verify });

      mockReq.headers.authorization = 'Bearer test-token';

      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(errors.ServerError);
      expect(mockNext.mock.calls[0][0].code).toBe(401);
    });

    it('[Express/Middlewares/DefaultBearerToken-0070] should use custom tokenType if provided', async () => {
      const user = {
        __tokenType: 'custom-token',
        __identifier: 'test-user',
      };

      const verify = jest.fn().mockResolvedValue(user);
      const middleware = defaultBearerToken({
        verify,
        tokenType: 'custom-token',
      });

      mockReq.headers.authorization = 'Bearer test-token';

      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.locals.user).toBe(user);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('[Express/Middlewares/DefaultBearerToken-0080] should validate token if validateToken provided', async () => {
      const user = {
        __tokenType: ACCESS_TOKEN_TYPE,
        __identifier: 'test-user',
      };

      const verify = jest.fn().mockResolvedValue(user);
      const validateToken = jest.fn().mockResolvedValue(true);

      const middleware = defaultBearerToken({
        verify,
        validateToken,
      });

      mockReq.headers.authorization = 'Bearer test-token';

      await middleware(mockReq, mockRes, mockNext);

      expect(validateToken).toHaveBeenCalledWith(user, 'test-token');
      expect(mockRes.locals.user).toBe(user);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('[Express/Middlewares/DefaultBearerToken-0090] should reject when validateToken returns false', async () => {
      const user = {
        __tokenType: ACCESS_TOKEN_TYPE,
        __identifier: 'test-user',
      };

      const verify = jest.fn().mockResolvedValue(user);
      const validateToken = jest.fn().mockResolvedValue(false);

      const middleware = defaultBearerToken({
        verify,
        validateToken,
      });

      mockReq.headers.authorization = 'Bearer test-token';

      await middleware(mockReq, mockRes, mockNext);

      expect(validateToken).toHaveBeenCalledWith(user, 'test-token');
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(errors.ServerError);
      expect(mockNext.mock.calls[0][0].code).toBe(401);
    });

    it('[Express/Middlewares/DefaultBearerToken-0100] should validate role if validateRole provided', async () => {
      const user = {
        __tokenType: ACCESS_TOKEN_TYPE,
        __identifier: 'test-user',
      };

      const verify = jest.fn().mockResolvedValue(user);
      const validateRole = jest.fn().mockResolvedValue(true);

      const middleware = defaultBearerToken({
        verify,
        validateRole,
      });

      mockReq.headers.authorization = 'Bearer test-token';

      await middleware(mockReq, mockRes, mockNext);

      expect(validateRole).toHaveBeenCalledWith(user);
      expect(mockRes.locals.user).toBe(user);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('[Express/Middlewares/DefaultBearerToken-0110] should reject with forbidden when validateRole returns false', async () => {
      const user = {
        __tokenType: ACCESS_TOKEN_TYPE,
        __identifier: 'test-user',
      };

      const verify = jest.fn().mockResolvedValue(user);
      const validateRole = jest.fn().mockResolvedValue(false);

      const middleware = defaultBearerToken({
        verify,
        validateRole,
      });

      mockReq.headers.authorization = 'Bearer test-token';

      await middleware(mockReq, mockRes, mockNext);

      expect(validateRole).toHaveBeenCalledWith(user);
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(errors.ServerError);
      expect(mockNext.mock.calls[0][0].code).toBe(403);
    });

    it('[Express/Middlewares/DefaultBearerToken-0120] should handle errors during verification', async () => {
      const verify = jest.fn().mockRejectedValue(new Error('Verification failed'));

      const middleware = defaultBearerToken({ verify });

      mockReq.headers.authorization = 'Bearer test-token';

      await middleware(mockReq, mockRes, mockNext);

      expect(mockLoggerError).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(errors.ServerError);
      expect(mockNext.mock.calls[0][0].code).toBe(401);
    });
  });

  describe('useUser', () => {
    it('[Express/Middlewares/DefaultBearerToken-0130] should return user from res.locals', () => {
      const user = {
        __tokenType: ACCESS_TOKEN_TYPE,
        __identifier: 'test-user',
      };

      mockRes.locals.user = user;

      const result = useUser({ res: mockRes } as TExpressParams);

      expect(result).toBe(user);
    });
  });
});
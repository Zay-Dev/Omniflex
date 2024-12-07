import { Request, Response } from 'express';
import { validateRefreshToken } from '../session.validation';

describe('Session Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = { body: {} };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should pass validation with valid refresh token', () => {
    mockRequest.body = { refreshToken: 'valid-token' };

    validateRefreshToken[0](
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith();
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });

  it('should fail validation with missing refresh token', () => {
    mockRequest.body = {};

    validateRefreshToken[0](
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should fail validation with empty refresh token', () => {
    mockRequest.body = { refreshToken: '' };

    validateRefreshToken[0](
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
  });
});
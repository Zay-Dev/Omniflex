import { mockRequest, mockResponse, mockNext } from '../../mock-utils';
import { errorHandler } from '@omniflex/infra-express/middlewares/error-handler';
import { BaseError } from '@omniflex/core/types/error';
import { Containers } from '@omniflex/core';

describe('ErrorHandler', () => {
  const req: any = mockRequest();
  const res: any = mockResponse();
  const next = mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles BaseError with default config', () => {
    const error = new BaseError({
      message: 'Test error',
      code: 400,
      error: 'BaseError'
    });

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: 400,
      error: 'BaseError',
      errorCode: 'BaseError',
      message: 'Test error'
    }));
  });

  test('includes error details when config allows', () => {
    jest.spyOn(Containers, 'configAs').mockReturnValue({
      env: 'test',
      logging: { exposeErrorDetails: true, level: 'error' },
      server: { requestTimeoutInSeconds: 30 }
    });

    const error = new BaseError({
      message: 'Test error',
      code: 400,
      error: 'BaseError',
      data: { details: 'test' }
    });

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: 400,
      error: 'BaseError',
      errorCode: 'BaseError',
      message: 'Test error',
      data: { details: 'test' }
    }));
  });
});
import { BaseError } from '@omniflex/core/types/error';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@omniflex/core';
import { configAs } from '@omniflex/core/config';

export const errorHandler = (
  error: Error | BaseError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof BaseError) {
    return handleBaseError(error, req, res);
  }

  handleGeneralError(error, req, res);
};

const handleGeneralError = (error: any = {}, req: Request, res: Response) => {
  const status = error.code || 500;
  const timestamp = new Date().toISOString();

  logger.error('Unhandled error occurred', {
    error,
    data: {
      timestamp,
      path: req.path,
      method: req.method,
    },
  });

  res.status(status).json({
    ...getBasicResponse(req, status, status, timestamp),
    ...getErrorResponseBody(error),
  });
};

const handleBaseError = (error: BaseError, req: Request, res: Response) => {
  const status = error.code || 500;
  const timestamp = new Date().toISOString();

  logger.error('Application error occurred', {
    error,
    data: {
      timestamp,
      path: req.path,
      method: req.method,
      errorCode: error.errorCode,
    }
  });

  res.status(status).json({
    ...getBasicResponse(req, error.code, status, timestamp),
    ...getErrorResponseBody(error),
  });
};

const getErrorResponseBody = (error: Error | BaseError) => {
  const config = configAs();
  const exposeData = error instanceof BaseError &&
    config.logging.exposeErrorDetails;

  const body = {
    message: error.message,
    errorCode: (error as any).errorCode || undefined,
    error: ((error as any).error || undefined) || error.name,
  };

  if (exposeData) {
    return {
      ...body,
      data: error.data || null,
    };
  }

  return body;
};

const getBasicResponse = (
  req: Request,
  code: number,
  status: number,
  timestamp: string,
) => ({
  code,
  status,
  timestamp,
  path: req.path || 'Unknown path',
  method: req.method || 'Unknown method',
});
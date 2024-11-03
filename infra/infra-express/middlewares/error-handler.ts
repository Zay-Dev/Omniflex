import { BaseError } from '@omniflex/core/types/error';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@omniflex/core';

const EXPOSE_ERROR_DETAILS = process.env.EXPOSE_ERROR_DETAILS === 'true';

export const errorHandler = (
  error: Error | BaseError,
  req: Request,
  res: Response,
  next: NextFunction,
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
    status,
    timestamp,
    code: status,
    ...(EXPOSE_ERROR_DETAILS ? { data: error.data } : {}),
    path: req.path || 'Unknown path',
    method: req.method || 'Unknown method',
    message: error.message || 'Internal Server Error',
    error: error.error || error.name || 'UnknownError',
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
    code: error.code,
    status,
    timestamp,
    ...(EXPOSE_ERROR_DETAILS ? { data: error.data } : {}),
    path: req.path || 'Unknown path',
    method: req.method || 'Unknown method',
    message: error.message,
    errorCode: error.errorCode,
    error: error.error || error.name,
  });
};
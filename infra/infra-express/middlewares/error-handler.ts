import { configAs } from '@omniflex/core/containers';
import { BaseError } from '@omniflex/core/types/error';
import { Request, Response, NextFunction } from '../types';

export const errorHandler = (
  error: Error | BaseError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.locals.error = error;

  if (error instanceof BaseError) {
    return handleBaseError(error, req, res);
  }

  handleGeneralError(error, req, res);
};

const handleGeneralError = (error: any = {}, req: Request, res: Response) => {
  const status = error.code || 500;
  const timestamp = new Date().toISOString();

  res.status(status).json({
    ...getBasicResponse(req, res, status, status, timestamp),
    ...getErrorResponseBody(error),
  });
};

const handleBaseError = (error: BaseError, req: Request, res: Response) => {
  const status = error.code || 500;
  const timestamp = new Date().toISOString();

  res.status(status).json({
    ...getBasicResponse(req, res, error.code, status, timestamp),
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
  res: Response,
  code: number,
  status: number,
  timestamp: string,
) => ({
  code,
  status,
  timestamp,
  appType: res.locals.appType,
  requestId: res.locals.requestId,
  path: req.path || 'Unknown path',
  method: req.method || 'Unknown method',
});
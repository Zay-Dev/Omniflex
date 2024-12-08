import { Containers } from '@omniflex/core';
import { BaseError } from '@omniflex/core/types/error';

import { Request, Response, NextFunction } from 'express';
import { asInfraLocals } from '@omniflex/infra-express/internal-types';

export const errorHandler = (
  error: Error | BaseError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  asInfraLocals(res).error = error;

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
  const config = Containers.configAs();
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
  appType: asInfraLocals(res).appType,
  requestId: asInfraLocals(res).requestId,
  path: req.path || 'Unknown path',
  method: req.method || 'Unknown method',
});
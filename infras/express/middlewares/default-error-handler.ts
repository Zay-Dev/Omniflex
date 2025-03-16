import * as Types from '../types';
import { Request, Response, NextFunction } from 'express';

type TError = Error | TServerError;
type TServerError = typeof errors.ServerError.prototype;

export const getDefaultErrorHandler = (hideStack?: true) => {
  const handle = (
    error: TError,
    req: Types.TOmniRequest,
    res: Types.TOmniResponse,
  ) => {
    const status = parseStatusCode(error);
    const code = error instanceof errors.ServerError ? error.code : status;

    res.status(status).json({
      code,
      status,

      message: error.message,

      ...getBasicResponse(req),
      ...getErrorResponseBody(error, hideStack),
    });
  };

  return (
    error: TError,
    req: Request,
    res: Response,
    _: NextFunction,
  ) => {
    handle(
      error,
      req as Types.TOmniRequest,
      res as Types.TOmniResponse,
    );
  };
};

const getErrorResponseBody = (error: TError, hideStack?: true) => {
  const body = {
    errorCode: (error as any).errorCode || undefined,
    error: (error as any).error || error.name || undefined,
  };

  if (hideStack !== true) {
    if (error instanceof errors.ServerError) {
      Object.assign(body, { data: error.data || null });
    } else {
      Object.assign(body, { error: error.stack });
    }
  }

  return body;
};

const getBasicResponse = (req: Types.TOmniRequest) => ({
  requestId: req._requestId,
  serverType: req._serverType,
  timestamp: new Date().toISOString(),

  path: req.path || 'Unknown path',
  method: req.method || 'Unknown method',
});

const parseStatusCode = (error: any) => {
  if (error instanceof errors.ServerError) {
    return error.code;
  }

  const tryParse = +error.code;
  return isNaN(tryParse) ? 500 : tryParse;
};
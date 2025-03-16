import { Request, Response, NextFunction } from 'express';

export type TMiddleware<TOutput = any> = (
  req: Request,
  res: Response,
  next: NextFunction,
) => TOutput;

export type TOmniRequest = Request & {
  _skipMorganLog?: true;

  _requestId: string;
  _serverType: string;
};

export type TOmniResponse = Response & {
  _error?: Error;

  _required: Record<string, any>;
  getRequired: <T = any>(key: string) => T;
};
import express from 'express';

export type TMiddleware<TOutput = any> = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => TOutput;

export type TExpressParams = {
  req: express.Request;
  res: express.Response;
  next: express.NextFunction;
};

export type TOmniRequest = express.Request & {
  _skipMorganLog?: true;

  _requestId: string;
  _serverType: string;
};

export type TOmniResponse = express.Response & {
  _error?: Error;

  _required: Record<string, any>;
  getRequired: <T = any>(key: string) => T;
};

export interface IHydratedRouter extends express.Router {
  useMiddlewares: (middlewares: express.RequestHandler[]) => express.Router;
};

export type TUser = {
  __tokenType: string;
  __identifier: string;
};
import type express from 'express';

declare global {
  type TFromRequest<T> = (req: express.Request) => T;
  type TStringFromRequest = TFromRequest<string>;
  type TNumberFromRequest = TFromRequest<number>;
  type TBooleanFromRequest = TFromRequest<boolean>;
}

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
};

export interface IHydratedRouter extends express.Router {
  useMiddlewares: (middlewares: express.RequestHandler[]) => express.Router;
};

export type TUser = {
  __tokenType: string;
  __identifier: string;
};
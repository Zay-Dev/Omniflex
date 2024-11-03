import {
  Router,
  Express,
  RequestHandler,
  Locals as BaseLocals,
  Response as BaseResponse,
} from 'express';

export type TServerMiddlewares = {
  before?: Array<RequestHandler>;
  after?: Array<RequestHandler>;
};

export type TBaseServer = {
  port: number;
  type: string;

  options?: {
    middlewares?: TServerMiddlewares;
  };
};

export type TServer = TBaseServer & {
  server: Express;
  getRouters: () => Record<string, Router>;
};

export type TStartOptions = {
  servers: TServer[];
  middlewares?: TServerMiddlewares;
};

export type TLocals = BaseLocals & {
  user?: any;
  appType: string;
  requestId: string;
};

export type Response = BaseResponse & {
  locals: TLocals;
};

export { Router } from 'express';
export type { Request, NextFunction, RequestHandler } from 'express';
export type { PathParams, RequestHandlerParams } from 'express-serve-static-core';

export type THydratedRouter = Router & {
  useMiddlewares: (middlewares: RequestHandler[]) => Router;
};
import {
  Router,
  Express,
  RequestHandler,
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

export type THydratedRouter = Router & {
  useMiddlewares: (middlewares: RequestHandler[]) => Router;
};
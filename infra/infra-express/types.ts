import { BaseError } from '@omniflex/core/types';

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

export type ProcessedRequest = {
  body: any;
  query: any;
  params: any;
  headers: Record<string, string>;
  path: string;
  method: string;
  url: string;
};

export type TLocals = BaseLocals & {
  user?: any;
  appType: string;
  requestId: string;
  request: ProcessedRequest;
  error?: Error | BaseError;
  required: Record<string, any>;
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
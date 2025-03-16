import './uncaught-error-handler';

import express from 'express';
import type * as Types from './types';
import * as Middlewares from './middlewares';

import cors from 'cors';
import { v4 as uuid } from 'uuid';
import responseTime from 'response-time';
import helmet, { HelmetOptions } from 'helmet';

type TOrFalse<T> = false | T;

type TFrontingOptions = {
  serverType: string;

  noExpressJson?: true;
  noResponseTime?: true;

  cors?: TOrFalse<cors.CorsOptions>;
  helmet?: TOrFalse<HelmetOptions>;
};

type TFallbackOptions = {
  hideErrorStack?: true;

  noDefault404?: true;
  noDefaultErrorHandler?: true;
};

type TOptions = TFrontingOptions & TFallbackOptions & {
  app?: express.Express;
  routers: express.Router[];

  frontingMiddlewares?: Types.TMiddleware[];
  fallbackMiddlewares?: Types.TMiddleware[];
};

export const preStart = ({
  app = express(),
  routers,

  frontingMiddlewares,
  fallbackMiddlewares,
  ...options
}: TOptions) => {
  defaultFrontingMiddlewares(app, options, frontingMiddlewares || []);

  routers.forEach(router => app.use(router));

  defaultFallbackMiddlewares(app, options, fallbackMiddlewares || []);

  return { app };
};

const defaultFallbackMiddlewares = (
  app: express.Express,
  options: TFallbackOptions,
  middlewares: Types.TMiddleware[],
) => {
  middlewares.forEach(middleware => app.use(middleware));

  //(server.options?.middlewares?.after || [])
  //  .concat(middleware.after || [])
  //  .forEach(middleware => app.use(middleware));

  options.noDefault404 !== true &&
    app.use(Middlewares.createHandler(
      (_, __, next) => next(errors.notFound())
    ));

  options.noDefaultErrorHandler !== true &&
    app.use(Middlewares.getDefaultErrorHandler(options.hideErrorStack));
};

const defaultFrontingMiddlewares = (
  app: express.Express,
  options: TFrontingOptions,
  middlewares: Types.TMiddleware[],
) => {
  app.use(Middlewares.createHandler((req, res, next) => {
    Object.assign(res.locals, {
      _required: {},
      getRequired: (key: string) => res.locals._required[key],
    }) as Types.TOmniResponse;

    Object.assign(req, {
      _requestId: uuid(),
      _serverType: options.serverType,
    } as Types.TOmniRequest);

    next();
  }));

  options.noResponseTime !== true &&
    app.use(responseTime());
  options.noExpressJson !== true &&
    app.use(express.json());

  options.helmet !== false &&
    app.use(helmet(options.helmet || undefined));

  options.cors !== false &&
    app.use(cors(options.cors || undefined));

  middlewares.forEach(middleware => app.use(middleware));
};
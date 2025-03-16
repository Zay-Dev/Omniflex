import express from 'express';
import type * as Types from './types';

import cors from 'cors';
import responseTime from 'response-time';
import helmet, { HelmetOptions } from 'helmet';

type TOrFalse<T> = false | T;

type TFrontingOptions = {
  noExpressJson?: true;
  noResponseTime?: true;

  cors?: TOrFalse<cors.CorsOptions>;
  helmet?: TOrFalse<HelmetOptions>;
};

type TFallbackOptions = {
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

  //app.use((_, __, next) => next(errors.notFound()));
  //app.use(errorHandler);
};

const defaultFrontingMiddlewares = (
  app: express.Express,
  options: TFrontingOptions,
  middlewares: Types.TMiddleware[],
) => {
  //app.use(requestPreparation(server.type));

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
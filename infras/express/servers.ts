import './uncaught-error-handler';

import express from 'express';
import type * as Types from './types';

import * as Routers from './routers';
import * as Middlewares from './middlewares';

import cors from 'cors';
import { v4 as uuid } from 'uuid';
import responseTime from 'response-time';
import helmet, { HelmetOptions } from 'helmet';

import { doubleCsrf, DoubleCsrfConfigOptions } from 'csrf-csrf';
import cookieParser, { CookieParseOptions } from 'cookie-parser';

declare global {
  namespace Express {
    class Locals {
      rawBody?: Buffer;
    }
  }
}

type TOrFalse<T> = false | T;

type TExpressJsonOptions = NonNullable<Parameters<typeof express.json>[0]>;

type TFrontingOptions = {
  serverType: string;

  expressJson?: TOrFalse<TExpressJsonOptions>;
  noResponseTime?: true;
  morganFormat?: TOrFalse<string>;

  cors?: TOrFalse<cors.CorsOptions>;
  helmet?: TOrFalse<HelmetOptions>;

  cookieParser: {
    secret: string;
    options?: CookieParseOptions,
  };

  doubleCsrf?: TOrFalse<DoubleCsrfConfigOptions & {
    cookiePrefix?: 'Host' | 'Secure';
  }>;
};

type TFallbackOptions = {
  hideErrorStack?: true;

  noDefault404?: true;
  noDefaultErrorHandler?: true;
};

type TOptions = TFrontingOptions & TFallbackOptions & {
  app?: express.Express;
  getRouters: () => express.Router[];
  uncaughtRouterErrorHandler?: TOrFalse<{ requestTimeoutInSeconds: number; }>;

  frontingMiddlewares?: Types.TMiddleware[];
  fallbackMiddlewares?: Types.TMiddleware[];
};

export const prepareApp = ({
  app = express(),
  getRouters,
  uncaughtRouterErrorHandler = false,

  frontingMiddlewares,
  fallbackMiddlewares,

  ...options
}: TOptions) => {
  defaultFrontingMiddlewares(app, options, frontingMiddlewares || []);

  getRouters().forEach(router => {
    app.use(router);

    uncaughtRouterErrorHandler !== false &&
      Routers.bindUncaughtRouterErrorHandler(
        router,
        uncaughtRouterErrorHandler.requestTimeoutInSeconds,
      );
  });

  defaultFallbackMiddlewares(app, options, fallbackMiddlewares || []);

  return { app };
};

const defaultFallbackMiddlewares = (
  app: express.Express,
  options: TFallbackOptions,
  middlewares: Types.TMiddleware[],
) => {
  middlewares.forEach(middleware => app.use(middleware));

  options.noDefault404 !== true &&
    app.use(Middlewares.createHandler(
      ({ next }) => next(errors.notFound()),
    ));

  options.noDefaultErrorHandler !== true &&
    app.use(Middlewares.getDefaultErrorHandler(options.hideErrorStack));
};

const defaultFrontingMiddlewares = (
  app: express.Express,
  options: TFrontingOptions,
  middlewares: Types.TMiddleware[],
) => {
  app.use(Middlewares.createHandler(({ req, res, next }) => {
    Object.assign(req, {
      _requestId: uuid(),
      _serverType: options.serverType,
    } as Types.TOmniRequest);

    next();
  }));

  options.noResponseTime !== true &&
    app.use(responseTime());

  if (options.expressJson !== false) {
    const expressJsonOptions = options.expressJson ?? {};
    const { verify: callerVerify, ...jsonOptions } = expressJsonOptions;

    app.use(express.json({
      ...jsonOptions,
      verify: (req, res, buffer, encoding) => {
        (res as express.Response).locals.rawBody = buffer;
        callerVerify?.(req, res, buffer, encoding);
      },
    }));
  }

  options.morganFormat !== false &&
    app.use(Middlewares.getMorganLogger(options.morganFormat || undefined));

  options.helmet !== false &&
    app.use(helmet(options.helmet || undefined));

  options.cors !== false &&
    app.use(cors(options.cors || undefined));

  app.use(cookieParser(
    options.cookieParser.secret,
    options.cookieParser.options,
  ));

  if (!!options.doubleCsrf) {
    const cookiePrefix = options.doubleCsrf.cookiePrefix || '';
    const cookieNameBody = options.doubleCsrf.cookieName || 'psifi.x-csrf-token';
    const cookieName = `__${cookiePrefix}-${cookieNameBody}`;

    const { generateToken, doubleCsrfProtection } = doubleCsrf({
      ...options.doubleCsrf,
      cookieName,
    });

    app.use(doubleCsrfProtection);

    app.get('/__/csrf-token', (req, res) => {
      res.json({
        csrfToken: generateToken(req, res),
      });
    });
  }

  middlewares.forEach(middleware => app.use(middleware));
};
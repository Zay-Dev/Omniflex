import { errors } from '@omniflex/core';
import { TServer, TServerMiddlewares } from '../types';

import cors from 'cors';
import helmet from 'helmet';
import responseTime from 'response-time';
import useragent from 'express-useragent';
import express, { Express } from 'express';
import fileUpload from 'express-fileupload';

import { errorHandler } from './error-handler';

export const applyMiddlewares = (
  app: Express,
  server: TServer,
  middleware: TServerMiddlewares = {},
  setupRoutes: () => void,
  {
    origin = "*",
    noContentSecurityPolicy = false,
  }: {
    noContentSecurityPolicy?: boolean;
    origin?: cors.CorsOptions['origin'];
  } = {}
) => {
  app.use(express.json());
  app.use(fileUpload());
  app.use(responseTime());
  app.use(helmet({ contentSecurityPolicy: !noContentSecurityPolicy }));
  app.use(useragent.express());
  app.use(cors({ origin }));

  (middleware.before || [])
    .concat(server.options?.middlewares?.before || [])
    .forEach(middleware => app.use(middleware));

  setupRoutes();

  (server.options?.middlewares?.after || [])
    .concat(middleware.after || [])
    .forEach(middleware => app.use(middleware));

  app.use((_, __, next) => next(errors.notFound()));
  app.use(errorHandler);
};
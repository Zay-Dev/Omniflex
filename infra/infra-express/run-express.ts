import { TStartOptions } from './types';
import { logger } from '@omniflex/core';
import { ILogger } from '@omniflex/core/types/logger';
import { bindAsyncFunctionDefaultErrorHandler } from './helpers/routers';

import express, { Express, Router } from 'express';
import { applyMiddlewares } from './middlewares/index';

export const createServer = express;

export const runExpress = ({
  servers = [],
  middlewares = {},
}: TStartOptions = {} as any) => {
  return Promise.all(servers.map(server => {
    const app = server.server;

    applyMiddlewares(
      app,
      server,
      middlewares,
      () => useRouters(app, server.getRouters()),
    );

    startServer({
      app,
      logger,

      type: server.type,
      port: server.port,
    });
  }));
};

const useRouters = (app: Express, routers: Record<string, Router>) => {
  Object.keys(routers).forEach(key => {
    const router = routers[key];

    app.use(key, router);
    bindAsyncFunctionDefaultErrorHandler(router);
  });
};

const startServer = async ({
  app,
  port,
  type,
  logger,
  fallbackMiddlewares,
}: {
  logger: ILogger;
  app: Express;
  port: number;
  type: string;
  fallbackMiddlewares?: () => Promise<void> | void;
}) => {
  const { createServer } = await import('http');
  const logError = (reason: string) => {
    logger.error(`Cannot start server: ${reason}`, {
      tags: type,
    });
  };

  if (!app) {
    logError("null reference to app");
    return null;
  }

  if (!type) {
    logError('type is not defined');
    return null;
  }

  if (!port) {
    logError(`invalid port (received ${port})`);
    return null;
  }

  const server = createServer(app);
  const listen = () => server.listen(port, () => {
    logger.info(`Listening on ${port}`, { tags: type });
  });

  await fallbackMiddlewares?.();
  return listen();
};
import { TStartOptions } from './types';
import { bindAsyncFunctionDefaultErrorHandler } from './helpers/routers';

import express, { Express, Router } from 'express';
//import { beforeRoutes, fallbacks } from './middlewares/index.mts';

const _logger = (() => {
  const logger = console.log.bind(null, '[TODO]');

  return {
    info: logger,
    debug: logger,
    warn: logger,
    error: logger,
  };
})();

export const createServer = express;

export const runExpress = ({
  servers = [],
  middlewares = {},
}: TStartOptions = {} as any) => {
  const logger = global.logger;

  return Promise.all(servers.map(server => {
    const app = server.server;

    //beforeRoutes.apply(app, server, middleware);
    useRouters(app, server.getRouters());
    //fallbacks.apply(app, server, middleware);

    startServer({
      app,
      logger,

      type: server.type,
      port: server.port,
      fallbackMiddlewares: () => {
      },
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
  logger = _logger,
  fallbackMiddlewares,
}: {
  //logger: ILogger;
  logger: any;
  app: Express;
  port: number;
  type: string;
  fallbackMiddlewares: () => Promise<void> | void;
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

  await fallbackMiddlewares();
  return listen();
};
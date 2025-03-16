import { logger, handleUncaughtException } from '@omniflex/core';

import { getExpressRouter } from './helpers/routers';
import { createServer, runExpress } from './run-express';

import {
  TServer,
  TStartOptions,
  THydratedRouter,
} from './types';

interface IBaseServer extends Omit<TServer, 'server' | 'getRouters'> {
  server?: TServer['server'];
  getRouters?: TServer['getRouters'];
}

const servers = new Map<string, IBaseServer>();
const routers = new Map<string, Map<string, THydratedRouter>>();

const addServer = (server: IBaseServer) => {
  if (servers.has(server.type)) {
    throw new Error(`Server type ${server.type} already exists`);
  }

  servers.set(server.type, server);
};

const formatRouterPath = (path: string) => {
  if (!path.startsWith('/')) {
    return formatRouterPath(`/${path}`);
  }

  if (!path.endsWith('/')) {
    return formatRouterPath(`${path}/`);
  }

  return path
    .replace(/\/{2,}/g, '/')
    .replace(/\/$/, '');
};

const addRouter = (
  serverType: string,
  routerPath: string,
  router: THydratedRouter,
) => {
  const path = formatRouterPath(routerPath);

  if (!servers.has(serverType)) {
    throw new Error(`Server type ${serverType} does not exist`);
  }

  if (!routers.has(serverType)) {
    routers.set(serverType, new Map());
  }

  if (routers.has(path)) {
    throw new Error(`Router path ${path} already exists`);
  }

  routers.get(serverType)?.set(path, router);
};

const getOrCreateRouter = (
  serverType: string,
  routerPath: string,
): THydratedRouter => {
  const path = formatRouterPath(routerPath);
  const router = routers.get(serverType)?.get(path);

  if (!servers.has(serverType)) {
    throw new Error(`Server type ${serverType} does not exist`);
  }

  if (router) return router;

  addRouter(serverType, path, getExpressRouter());
  return getOrCreateRouter(serverType, routerPath);
};

const start = (options?: Omit<TStartOptions, "servers">) => {
  const parsedServers = Array.from(servers.values())
    .map(({ server, getRouters, type, ...rest }) => {
      const tags = type;
      const setup = {
        ...rest,
        type,
        server: server || createServer(),
        getRouters: getRouters || (() => ({})),
      };

      if (!server) {
        logger.info('Apply default \'createServer()\'', { tags });
      }

      if (!getRouters) {
        const serverRouters = routers.get(type);

        if (!serverRouters?.size) {
          logger.warn('No router is defined', { tags });
          setup.getRouters = () => ({});
        } else {
          logger.debug(
            Array.from(serverRouters.keys()).join(', '),
            { tags },
          );
          setup.getRouters = () => Object.fromEntries(serverRouters);
        }
      }

      console.log("-->");
      return setup;
    });

  handleUncaughtException();

  return runExpress({
    ...(options || {}),
    servers: parsedServers,
  });
};

export const AutoServer = {
  start,
  addServer,
  getOrCreateRouter,
};
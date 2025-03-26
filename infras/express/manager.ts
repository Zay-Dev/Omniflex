import { Router } from 'express';
import * as Routers from './routers';
import { IHydratedRouter } from './types';

const normalizePath = (path: string) => {
  if (!path.startsWith('/')) {
    return normalizePath(`/${path}`);
  }

  if (!path.endsWith('/')) {
    return normalizePath(`${path}/`);
  }

  return path
    .replace(/\/{2,}/g, '/')
    .replace(/\/$/, '');
};

const getManager = () => {
  const rootRouter = Router();
  const routers = new Map<string, IHydratedRouter>();

  const addRouter = (
    routerPath: string,
    router: IHydratedRouter,
  ) => {
    const path = normalizePath(routerPath);

    if (routers.has(path)) {
      throw new Error(`Router path '${path}' already exists`);
    }

    routers.set(path, router);
    rootRouter.use(path, router);

    return router;
  };

  const getOrCreateRouter = (
    routerPath: string,
  ): IHydratedRouter => {
    const path = normalizePath(routerPath);

    return routers.get(path) ||
      addRouter(path, Routers.getHydrated());
  };

  return {
    rootRouter,

    addRouter,
    getOrCreateRouter,
    getPaths: () => Array.from(routers.keys()),
  };
};

export const initialize = <T extends string>(types: Iterable<T>) => {
  const managers = new Map([...types].map(type => [type, getManager()]));

  const requireManager = (serverType: T) => {
    if (!managers.has(serverType)) {
      throw new Error(`Server type '${serverType}' does not exist`);
    }

    return managers.get(serverType)!;
  };

  const getOrCreateRouter = (
    serverType: T,
    routerPath: string,
  ): IHydratedRouter => {
    return requireManager(serverType).getOrCreateRouter(routerPath);
  };

  return {
    getOrCreateRouter,

    getRouter: (serverType: T, {
      skipPathsPrint = false,
      throwEmptyRouters = false,
    } = {}) => {
      const manager = requireManager(serverType);

      const rootRouter = manager.rootRouter;
      const paths = manager.getPaths();

      if (paths.length) {
        if (!skipPathsPrint) {
          logger.debug(`[${serverType}] ${paths.join(', ')}`);
        }
      } else {
        const message = `No routers are defined for server type '${serverType}'`;

        if (throwEmptyRouters) {
          throw getThrowable(message);
        } else {
          logger.warn(message);
        }
      }

      return rootRouter;
    },
  };
};
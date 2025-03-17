import { IHydratedRouter } from './types';
import { Router, Request } from 'express';

import {
  ILayer,
  IRoute,
  PathParams,
  RequestHandlerParams,
} from 'express-serve-static-core';

export const get = () => Router();

export const getHydrated = () => {
  const router = get() as IHydratedRouter;

  router.useMiddlewares = (middlewares: RequestHandlerParams[]) => {
    const nestedRouter = Router();
    const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;

    router.use(nestedRouter);

    methods
      .forEach((method) => {
        const fn = nestedRouter[method].bind(nestedRouter);

        nestedRouter[method] = (path: PathParams, ...handlers: RequestHandlerParams[]) => {
          return fn(path,
            ...(middlewares || []).filter(Boolean),
            ...(handlers || []).filter(Boolean),
          );
        };
      });

    return nestedRouter;
  };

  return router;
};

export const bindUncaughtRouterErrorHandler = (
  router: Router,
  requestTimeoutInSeconds: number,
) => {
  if ((router as any)._unsafeRoutes) return;

  const handleLayer = (layer: ILayer) => {
    switch (layer.name.toLowerCase()) {
      case 'bound dispatch':
        handleDispatcher(layer);
        break;
      case 'router':
        bindUncaughtRouterErrorHandler(
          layer.handle as Router,
          requestTimeoutInSeconds,
        );
        break;
      default:
        logger.silly(
          `Unhandled layer, type: ${layer.name.toLowerCase()}`,
          { data: { layer } },
        );
        break;
    }
  };

  const handleDispatcher = (layer: ILayer) => {
    const route = (layer.route as IRoute);
    const { path } = route;

    for (const layer of route.stack) {
      const { handle } = layer;

      const stringify = (object: any) => {
        try {
          return JSON.stringify(object);
        } catch (ex) {
          console.log('stringify error', ex);
          console.log('original object', object);
          return 'Cannot stringify due to error';
        }
      };

      layer.handle = (req: Request, res, next) => {
        const promise = handle(req, res, next)?.catch((error) => {
          const request = {
            path,
            url: req.url,
            method: req.method,
            params: req.params,
            query: req.query,
            body: req.body,
          };
          const stringifiedError = stringify(error);

          logger.error(
            `==== EMEG ==== Unhandled error in middleware:
${JSON.stringify(request)}

error (${error?.message || 'N/a'}):
${stringifiedError}

body:
${handle.toString()}`
          );

          return next(errors.custom('Unexpected Error.', 500));
        });

        if (!promise) {
          setTimeout(() => {
            if (!res.headersSent) {
              return next(errors.custom('Timed out.', 408));
            }
          }, 1000 * requestTimeoutInSeconds);
        }
      };
    }
  };

  (router.stack || []).forEach(handleLayer);
};
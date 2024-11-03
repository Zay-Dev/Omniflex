//import config from '@/config';
import { logger } from '@omniflex/core';
//import { CustomError } from '@omniflex/core/types/error';

import { THydratedRouter } from '../types';
import { IRoute, ILayer } from 'express-serve-static-core';

import {
  Router,
  Request,
  Response,
  PathParams,
  NextFunction,
  RequestHandlerParams,
} from '../types';

export const getExpressRouter = () => {
  const router = Router() as THydratedRouter;

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

export const nextRouteIf = (
  check: (req: Request, res: Response, next: NextFunction) => boolean | Promise<boolean>,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    return await check(req, res, next) ? next('route') : next();
  };
};

export const bindAsyncFunctionDefaultErrorHandler = (router: Router) => {
  const handleLayer = (layer: ILayer) => {
    switch (layer.name.toLowerCase()) {
      case 'bound dispatch':
        handleDispatcher(layer);
        break;
      case 'router':
        bindAsyncFunctionDefaultErrorHandler(layer.handle as Router);
        break;
      default:
        console.log(layer, 'Unhandled');
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

          //return next(new CustomError({
          return next(({
            code: 500,
            message: 'Unexpected Error.',
          }));
        });

        if (!promise) {
          setTimeout(() => {
            if (!res.headersSent) {
              next(new Error('Timed out'));
            }
          }, 1000 * 30);
          //}, 1000 * config.requestTimeoutInSeconds);
        }
      };
    }
  };

  (router.stack || []).forEach(handleLayer);
};
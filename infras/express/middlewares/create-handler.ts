import { TMiddleware, TExpressParams } from '../types';

type THydratedParams = TExpressParams & ReturnType<typeof hydrateParams>;
type TCallback = (express: THydratedParams) => any;

const hydrateParams = (express: TExpressParams) => {
  const { req, res, next } = express;

  const params = {
    ...express,

    try: async <T,>(callback: () => T | Promise<T>) => {
      try {
        return await callback();
      } catch (ex) {
        next(ex);
        return undefined;
      }
    },

    tryWithBody: async <T, TBody>(callback: (body: TBody) => T | Promise<T>) => {
      try {
        return await callback(req.body);
      } catch (ex) {
        next(ex);
        return undefined;
      }
    },
  };

  return params;
};

export const createHandler = (callback: TCallback) => {
  const handler: TMiddleware = (req, res, next) => {
    callback(hydrateParams({ req, res, next }));
  };

  return handler;
};

export const createHandlerWithTry = (callback: TCallback) => {
  const handler: TMiddleware = (req, res, next) => {
    const params = hydrateParams({ req, res, next });

    params.try(async () => await callback(params));
  };

  return handler;
};
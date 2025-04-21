import type { TMiddleware, TExpressParams } from '../types';

type THydratedParams = TExpressParams & ReturnType<typeof hydrateParams>;
type TCallback = (express: THydratedParams) => any;

type TTryOptions = {
  onError?: (error: any, express: TExpressParams) => any | Promise<any>;
};

export const createHandler = (callback: TCallback) => {
  const handler: TMiddleware = async (req, res, next) => {
    await callback(hydrateParams({ req, res, next }));
  };

  return handler;
};

export const createHandlerWithTry = (callback: TCallback) => {
  const handler: TMiddleware = async (req, res, next) => {
    const params = hydrateParams({ req, res, next });

    await params.try(async () => await callback(params));
  };

  return handler;
};

const hydrateParams = (express: TExpressParams) => {
  const { req, res, next } = express;

  const parsedPage = parseInt(`${req.query?.page}`, 10);
  const parsedPageSize = parseInt(`${req.query?.pageSize}`, 10);

  const page = isNaN(parsedPage) ? undefined : parsedPage;
  const pageSize = isNaN(parsedPageSize) ? undefined : parsedPageSize;

  const params = {
    ...express,

    page,
    pageSize,

    deletedOne: () => { res.status(204).end(); },
    respondOne: async <T = any>(data: T | Promise<T>) => {
      res.json(await data);
    },

    patchedOne: async <T = any>(data: T | Promise<T>) => {
      res.status(200);
      await params.respondOne(data);
    },

    createdOne: async <T = any>(data: T | Promise<T>) => {
      res.status(201);
      await params.respondOne(data);
    },

    respondMany: async <T = any>(
      dataOrDataPromise: T[] | Promise<T[]>,
      count?: number,
      { skipHydrate = false } = {},
    ) => {
      const data = await dataOrDataPromise;
      const total = count ?? data.length;
      const base = { data, total };

      if (skipHydrate !== true) {
        base.data = data.map((item, i) => {
          return {
            __index: i,
            ...item,
          };
        });
      }

      res.json(base);
    },

    try: async <T,>(
      callback: () => T | Promise<T>,
      { onError = (error) => error }: TTryOptions = {},
    ) => {
      try {
        return await callback();
      } catch (error) {
        next(await onError(error, params));
        return undefined;
      }
    },

    tryWithBody: async <T, TBody>(
      callback: (body: TBody) => T | Promise<T>,
      { onError = (error) => error }: TTryOptions = {},
    ) => {
      try {
        return await callback(req.body);
      } catch (error) {
        next(await onError(error, params));
        return undefined;
      }
    },
  };

  return params;
};
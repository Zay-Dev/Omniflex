import type { TMiddleware, TExpressParams } from '../types';

export type THydratedParams = TExpressParams & ReturnType<typeof hydrateParams>;

export type TCallback<
  T = any,
  TValidatedDoc = never,
> = (
  express: THydratedParams,
  doc: TValidatedDoc,
) => T | Promise<T>;

type TTryOptions = {
  onError?: (error: any, express: TExpressParams) => any | Promise<any>;
};

export function createHandler<TValidatedDoc>(
  validate: TCallback<TValidatedDoc>,
  callback: TCallback<void, TValidatedDoc>,
): TMiddleware;

export function createHandler(callback: TCallback): TMiddleware;

export function createHandler<TValidatedDoc>(
  validateOrCallback: TCallback<TValidatedDoc>,
  callback?: TCallback<void, TValidatedDoc>,
) {
  const handler: TMiddleware = async (req, res, next) => {
    const params = hydrateParams({ req, res, next });

    const doc = await params.try(async () => {
      return await validateOrCallback(params, undefined as never);
    });

    if (doc && callback) {
      await callback(params, doc);
    }
  };

  return handler;
};

export function createHandlerWithTry<TValidatedDoc>(
  validate: TCallback<TValidatedDoc>,
  callback: TCallback<void, TValidatedDoc>,
): TMiddleware;

export function createHandlerWithTry(callback: TCallback): TMiddleware;

export function createHandlerWithTry<TValidatedDoc>(
  validateOrCallback: TCallback<TValidatedDoc>,
  callback?: TCallback<void, TValidatedDoc>,
) {
  const handler: TMiddleware = async (req, res, next) => {
    const params = hydrateParams({ req, res, next });

    await params.try(async () => {
      const doc = await validateOrCallback(params, undefined as never);

      if (callback) {
        await callback(params, doc);
      }
    });
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
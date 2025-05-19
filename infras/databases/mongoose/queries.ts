import type { QueryWithHelpers, HydratedDocument } from 'mongoose';

import { Types, RootFilterQuery } from 'mongoose';
import { TSort, TModel, isObjectId } from './types';

type TQuery<T> = QueryWithHelpers<
  Array<HydratedDocument<T>>,
  HydratedDocument<T>,
  {},
  T,
  'find',
  {}
>;

type TSortable<T> = {
  sort?: TSort<T>;
};

type TPageable = {
  page?: number;
  pageSize?: number;
};

type TMayError = {
  modelName?: string;
};

type TPipeFn = <T, >(query: TQuery<T>) => TQuery<T>;

export const pipe = <T,>(
  query: TQuery<T>,
  ...fns: Array<TPipeFn>
) => {
  return fns.reduce((acc, fn) => fn(acc), query);
};

export const getSortPipeFn = <T,>({ sort = {} }: TSortable<T>) => {
  const stringifiedSort = Object.keys(sort)
    .map(key => sort[key]! < 0 ? `-${key}` : key)
    .join(' ')
    .trim();

  return <T,>(query: TQuery<T>) => {
    return stringifiedSort ? query.sort(stringifiedSort) : query;
  };
};

export const getPaginatePipeFn = ({ page, pageSize }: TPageable) => {
  return <T,>(query: TQuery<T>) => {
    if (!page || !pageSize) return query;
    if (page < 1 || pageSize < 1) return query;

    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    return query.skip(skip).limit(limit);
  };
};

export const queryBy = <T,>(
  model: TModel<T>,
  defaultQuery: RootFilterQuery<T> = {},
  options: TSortable<T> & TPageable = {},
) => {
  return pipe(
    model.find<HydratedDocument<T>>({
      deletedAt: null,
      isDeleted: { $ne: true },

      ...defaultQuery,
    }),
    getSortPipeFn(options),
    getPaginatePipeFn(options),
  );
};

export const queryById = <T,>(
  model: TModel<T>,
  id: Types.ObjectId | string,
  extendedQuery: RootFilterQuery<T> = {},
) => {
  if (!isObjectId(id)) {
    throw errors.badRequest('Invalid id format');
  }

  const _id = new Types.ObjectId(id);

  return model.findOne({
    _id,
    deletedAt: null,
    isDeleted: { $ne: true },

    ...extendedQuery,
  });
};

export const atLeastOne = async<T,>(
  model: TModel<T>,
  query: RootFilterQuery<T>,
  {
    modelName = model.modelName,
    ...options
  }: TMayError & TSortable<T> & TPageable = {},
) => {
  const baseQuery = queryBy(model, query, options);
  const length = await baseQuery.clone().countDocuments();

  if (length < 1) {
    throw errors.notFound(`[${modelName}] expecting at least one result, but got 0`);
  }

  return await baseQuery.lean<T[]>();
};

type THasCountParameters<T,
  TNoLean extends (boolean | undefined) = boolean | undefined
> = Parameters<(
  count: number,
  model: TModel<T>,
  query: RootFilterQuery<T>,
  options?: TMayError & TSortable<T> & TPageable & { noLean?: TNoLean; },
) => never>;

export async function hasCount<T>(
  ...args: THasCountParameters<T, false | undefined>
): Promise<T[]>;

export async function hasCount<T>(
  ...args: THasCountParameters<T, true>
): Promise<{ query: TQuery<T>; }>;

export async function hasCount<T>(...[
  count,
  model,
  query,
  {
    noLean,
    modelName = model.modelName,

    ...options
  } = {},
]: THasCountParameters<T>) {
  const baseQuery = queryBy(model, query, options);
  const length = await baseQuery.clone().countDocuments();

  if (length != count) {
    if (length < count) {
      throw errors.notFound(`[${modelName}] expecting length ${count}, but got ${length}`);
    }

    throw errors.unprocessableEntity(`[${modelName}] expecting length ${count}, but got ${length}`);
  }

  if (noLean) return { query: baseQuery };

  return await baseQuery.lean<T[]>();
};

export const hasExactOne = async<T,>(
  model: TModel<T>,
  query: RootFilterQuery<T>,
  {
    modelName = model.modelName,
    ...options
  }: TMayError & TSortable<T> & TPageable = {},
) => {
  return (await hasCount(1, model, query, { modelName, ...options }))[0];
};

export const requiredFirst = async<T,>(
  model: TModel<T>,
  query: RootFilterQuery<T>,
  options: TMayError & TSortable<T> & TPageable = {},
) => {
  return (await atLeastOne(model, query, options))[0];
};
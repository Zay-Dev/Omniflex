import { Types, RootFilterQuery } from 'mongoose';
import { TSort, TModel, isObjectId } from './types';

type TFind<T> = TModel<T>['find'];
type TQuery<T> = ReturnType<TFind<T>>;

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
  const parsedPage = parseInt(`${page}`, 10);
  const parsedPageSize = parseInt(`${pageSize}`, 10);

  return <T,>(query: TQuery<T>) => {
    if (!parsedPage || !parsedPageSize) return query;
    if (parsedPage < 1 || parsedPageSize < 1) return query;

    const skip = (parsedPage - 1) * parsedPageSize;
    const limit = parsedPageSize;

    return query.skip(skip).limit(limit);
  };
};

export const queryBy = <T,>(
  model: TModel<T>,
  defaultQuery: RootFilterQuery<T> = {},
  options: TSortable<T> & TPageable = {},
) => {
  return pipe(
    model.find({
      isDeleted: { $ne: true },
      ...defaultQuery,
    }),
    getSortPipeFn(options),
    getPaginatePipeFn(options),
  );
};

export const queryById = <T,>(
  model: TModel<T>,
  id: Types.ObjectId,
  extendedQuery: RootFilterQuery<T> = {},
) => {
  if (!isObjectId(id)) {
    throw errors.badRequest('Invalid id format');
  }

  return model.findOne({
    _id: id,
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

export const hasCount = async<T,>(
  count: number,
  model: TModel<T>,
  query: RootFilterQuery<T>,
  {
    modelName = model.modelName,
    ...options
  }: TMayError & TSortable<T> & TPageable = {},
) => {
  const baseQuery = queryBy(model, query, options);
  const length = await baseQuery.clone().countDocuments();

  if (length != count) {
    if (count <= 0) {
      throw errors.notFound(`[${modelName}] expecting length ${count}, but got ${length}`);
    }

    throw errors.unprocessableEntity(`[${modelName}] expecting length ${count}, but got ${length}`);
  }

  return count > 0 ? await baseQuery.lean<T[]>() : [];
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
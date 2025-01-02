import { v4 as uuid } from 'uuid';
import { errors } from '@omniflex/core';
import { BaseError } from '@omniflex/core/types/error';
import { TDeepPartial, IBaseRepository } from '@omniflex/core/types/repository';

type TOptions<T, TPrimaryKey> = {
  notFoundMessage?: string;
  onError?: (error) => void,
  repository: IBaseRepository<T, TPrimaryKey>,

  countOnly?: boolean;
  retrieve?: (data: T | null) => void | Promise<void>;
};

type TEnsureNotExistsOptions<T, TPrimaryKey> = {
  repository: IBaseRepository<T, TPrimaryKey>;
  existsMessage?: string;
  onError?: (error: BaseError, entity: T) => void;
};

const validate = async (
  query: Record<string, any>,
  options: TOptions<any, any> & { notFoundMessage: string; },
) => {
  const { onError, repository } = options;

  const handleError = () => {
    const error = errors.notFound(options.notFoundMessage);

    if (onError) return onError(error);
    throw error;
  };

  if (options.countOnly) {
    const exists = await repository.exists(query);

    if (!exists) return handleError();
    return options.retrieve?.(null);
  }

  const entity = await repository.findOne(query);

  if (!entity) return handleError();

  await options.retrieve?.(entity);
  return entity;
};

export const requiredById = async <
  TPrimaryKey = string,
  T extends {} = Record<string, any>,
>(
  id: TPrimaryKey,
  options: TOptions<T, TPrimaryKey>,
) => {
  const query = { id };

  return await validate(query, {
    ...options,
    notFoundMessage: options.notFoundMessage ||
      `Entity with id ${id} not found`,
  });
};

export const requiredFirstMatch = async<
  T extends {} = Record<string, any>
>(
  query: TDeepPartial<T>,
  options: TOptions<T, any>,
) => {
  return await validate(query, {
    ...options,
    notFoundMessage: options.notFoundMessage || '',
  });
};

export const eitherExists = async<
  T extends {} = Record<string, any>
>(
  queries: TDeepPartial<T>[],
  options: Omit<TOptions<T, any>, 'countOnly'>,
) => {
  const identifier = uuid();
  const notFoundMessage = options.notFoundMessage || '';

  const isExists = (query: TDeepPartial<T>) => {
    return new Promise((resolve, reject) => {
      validate(query, {
        ...options,
        countOnly: true,
        notFoundMessage: identifier,
        retrieve: undefined,
        onError: (error) => {
          if (error instanceof BaseError && error.message == identifier) {
            resolve(null);
          } else {
            reject(error);
          }
        },
      }).then(() => resolve(true)).catch(reject);
    });
  };

  const exists = (await Promise.all(queries.map(isExists)))
    .some((exists) => exists === true);

  if (!exists) {
    const error = errors.notFound(notFoundMessage);

    if (options.onError) {
      return options.onError(error);
    }

    throw error;
  }

  return options.retrieve?.(null);
};

export const ensureNotExists = async<
  T extends {} = Record<string, any>
>(
  query: TDeepPartial<T>,
  options: TEnsureNotExistsOptions<T, any>,
) => {
  const { onError, repository } = options;
  const entity = await repository.findOne(query);

  if (entity) {
    const error = errors.badRequest(
      options.existsMessage || 'Entity already exists',
    ) as BaseError;

    if (onError) return onError(error, entity);
    throw error;
  }
};
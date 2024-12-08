import { errors } from '@omniflex/core';
import { TDeepPartial, IBaseRepository } from '@omniflex/core/types/repository';

type TOptions<T, TPrimaryKey> = {
  notFoundMessage?: string;
  onError?: (error) => void,
  repository: IBaseRepository<T, TPrimaryKey>,

  countOnly?: boolean;
  retrieve?: (data: T | null) => void | Promise<void>;
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
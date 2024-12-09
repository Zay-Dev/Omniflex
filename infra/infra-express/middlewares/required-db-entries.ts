import { errors } from '@omniflex/core';
import * as Base from '@omniflex/core/middlewares/required-db-entries';
import { TDeepPartial, IBaseRepository } from '@omniflex/core/types/repository';

import { asInfraLocals } from '../internal-types';
import { Request, Response, NextFunction } from 'express';

const manageFetched = (
  obj: Record<string, any>,
  proposedKey: string,
  value: any,
  currentIndex: number = 1,
) => {
  const keys = Object.keys(obj);
  if (!keys.includes(proposedKey)) {
    return {
      ...obj,
      [proposedKey]: value,
    };
  }

  return manageFetched(
    obj,
    `${proposedKey}_${currentIndex}`,
    value,
    currentIndex + 1,
  );
};

export const byPathId = <T extends {}, TPrimaryKey>(
  repository: IBaseRepository<T, TPrimaryKey>,
  countOnlyOrKeyName: true | string = '_byId',
  { fieldName = 'id' }: { fieldName?: string; } = {},
) => {
  return byId(repository, (req) => req.params[fieldName], countOnlyOrKeyName);
};

export const byBodyId = <T extends {}, TPrimaryKey>(
  repository: IBaseRepository<T, TPrimaryKey>,
  countOnlyOrKeyName: true | string = '_byId',
  { fieldName = 'id' }: { fieldName?: string; } = {},
) => {
  return byId(repository, (req) => req.body[fieldName], countOnlyOrKeyName);
};

export const byId = <T extends {}, TPrimaryKey>(
  repository: IBaseRepository<T, TPrimaryKey>,
  getId: (req: Request, res: Response, next: NextFunction) => TPrimaryKey | Promise<TPrimaryKey>,
  countOnlyOrKeyName: true | string = '_byId',
) => {
  return (async (req: Request, res: Response, next: NextFunction) => {
    const id = await getId(req, res, next);

    if (!repository.isValidPrimaryKey(id)) {
      return next(errors.badRequest('Invalid ID'));
    }

    const countOnly = countOnlyOrKeyName === true;
    const keyName = countOnlyOrKeyName === true ?
      '_byId' : countOnlyOrKeyName;

    Base.requiredById(id, {
      countOnly,
      repository,
      onError: next,
      retrieve: (_byId) => {
        if (!countOnly) {
          asInfraLocals(res).required = manageFetched(
            asInfraLocals(res).required || {},
            keyName,
            _byId,
          );
        }

        return next();
      },
    });
  });
};

export const firstMatch = <T extends {}, TPrimaryKey>(
  repository: IBaseRepository<T, TPrimaryKey>,
  getQuery: (req: Request, res: Response, next: NextFunction) => TDeepPartial<T> | Promise<TDeepPartial<T>>,
  countOnlyOrKeyName: true | string = '_firstMatch',
) => {
  return (async (req: Request, res: Response, next: NextFunction) => {
    const query = await getQuery(req, res, next);

    const countOnly = countOnlyOrKeyName === true;
    const keyName = countOnlyOrKeyName === true ?
      '_firstMatch' : countOnlyOrKeyName;

    Base.requiredFirstMatch(query, {
      countOnly,
      repository,
      onError: next,
      retrieve: (_firstMatch) => {
        if (!countOnly) {
          asInfraLocals(res).required = manageFetched(
            asInfraLocals(res).required || {},
            keyName,
            _firstMatch,
          );
        }

        return next();
      },
    });
  });
};
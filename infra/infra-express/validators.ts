import { errors } from '@omniflex/core';
import { IBaseRepository } from '@omniflex/core/types/repository';

import {
  Request,
  Response,
  NextFunction,
} from '@omniflex/infra-express/types';

import {
  requiredById,
  requiredFirstMatch,
} from '@omniflex/core/middlewares/required-db-entries';

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

export const DbEntries = {
  requiredById: (
    repository,
    getId: (req: Request, res: Response, next: NextFunction) => any,
    countOnlyOrKeyName: true | string = '_byId',
  ) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const id = getId(req, res, next);
      if (!repository.isValidPrimaryKey(id)) {
        return next(errors.badRequest('Invalid ID'));
      }

      const countOnly = countOnlyOrKeyName === true;
      const keyName = countOnlyOrKeyName === true ?
        '_byId' : countOnlyOrKeyName;

      requiredById(id, {
        countOnly,
        repository,
        onError: next,
        retrieve: (_byId) => {
          if (!countOnly) {
            res.locals.required = manageFetched(
              res.locals.required || {},
              keyName,
              _byId,
            );
          }

          return next();
        },
      });
    };
  },

  requiredFirstMatch: <T extends {}, TPrimaryKey>(
    repository: IBaseRepository<T, TPrimaryKey>,
    getQuery: (req: Request, res: Response, next: NextFunction) => Partial<T>,
    countOnlyOrKeyName: true | string = '_firstMatch',
  ) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const query = getQuery(req, res, next);

      const countOnly = countOnlyOrKeyName === true;
      const keyName = countOnlyOrKeyName === true ?
        '_byId' : countOnlyOrKeyName;

      requiredFirstMatch(query, {
        countOnly,
        repository,
        onError: next,
        retrieve: (_firstMatch) => {
          if (!countOnly) {
            res.locals.required = manageFetched(
              res.locals.required || {},
              keyName,
              _firstMatch,
            );
          }

          return next();
        },
      });
    };
  },
};
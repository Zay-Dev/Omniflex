import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { TInfraExpressLocals } from '@omniflex/infra-express/internal-types';

export const requestPreparation = (type: string) => {
  return (_: Request, res: Response, next: NextFunction) => {
    res.locals = {
      appType: type,
      user: undefined,

      required: {},
      requestId: uuidv4(),
    } as TInfraExpressLocals;

    return next();
  };
};
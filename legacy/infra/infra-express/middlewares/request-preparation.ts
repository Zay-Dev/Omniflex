import { Request, Response, NextFunction } from 'express';
import { initializeLocals } from '../utils/locals-initializer';

export const requestPreparation = (type: string) => {
  return (_: Request, res: Response, next: NextFunction) => {
    res.locals = initializeLocals(type);
    return next();
  };
};
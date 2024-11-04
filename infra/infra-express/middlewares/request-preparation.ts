import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from '../types';

export const requestPreparation = (type: string) => {
  return (_: Request, res: Response, next: NextFunction) => {
    res.locals = {
      appType: type,
      user: undefined,
      requestId: uuidv4(),
      request: null as any,
    };

    return next();
  };
};
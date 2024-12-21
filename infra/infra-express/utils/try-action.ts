import { Utils } from '@omniflex/core';
import { Request, Response, NextFunction } from 'express';

export const tryAction = (
  action: (req: Request, res: Response) => Promise<any> | any,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    return Utils.tryAction(
      async () => {
        await action(req, res);
        return next();
      },
      { next },
    );
  };
};
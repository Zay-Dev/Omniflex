import { Utils } from '@omniflex/core';
import { Request, Response, NextFunction } from 'express';

export const respondOne = (res: Response, data: any) => {
  return res.json({ data });
};

export const respondRequired = (res: Response, locals: any, key: string) => {
  return respondOne(res, locals.required[key]);
};

export const respondMany = (res: Response, data: Array<any> = [], total?: number) => {
  return res.json({
    data,
    total: total || data.length,
  });
};

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
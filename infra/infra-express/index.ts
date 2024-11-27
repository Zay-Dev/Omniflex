import { Request, Response, NextFunction } from 'express';

export { AutoServer } from './auto-server';

export * from './utils/base-controller';
export * from './utils/base-entities-controller';

export const getControllerCreator = <T>(
  constructor: new (req: Request, res: Response, next: NextFunction) => T
) => {
  return (
    callback: (controller: T) => void | Promise<void>
  ) => {
    return (req: Request, res: Response, next: NextFunction) => {
      return callback(new constructor(req, res, next));
    };
  };
};
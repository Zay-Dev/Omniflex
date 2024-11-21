import { Request, Response, NextFunction } from 'express';

export { AutoServer } from './auto-server';

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
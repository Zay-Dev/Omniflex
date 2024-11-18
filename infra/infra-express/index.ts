import { Request, Response, NextFunction } from 'express';

export { AutoServer } from './auto-server';

export const getControllerCreator = <TBase>() => {
  return <T extends TBase = TBase>(
    constructor: new (req: Request, res: Response, next: NextFunction) => T
  ) => {
    return (req: Request, res: Response, next: NextFunction) =>
      new constructor(req, res, next);
  };
};
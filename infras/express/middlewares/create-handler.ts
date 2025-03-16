import { TMiddleware } from '../types';

export const createHandler = (callback: TMiddleware) => {
  const handler: TMiddleware = (req, res, next) => {
    callback(req, res, next)?.catch(next);
  };

  return handler;
};
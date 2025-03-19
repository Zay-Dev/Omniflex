import { TMiddleware, TExpressParams } from '../types';

type TCallback = (express: TExpressParams) => void | Promise<void>;

export const createHandler = (callback: TCallback) => {
  const handler: TMiddleware = (req, res, next) => {
    callback({ req, res, next });
  };

  return handler;
};
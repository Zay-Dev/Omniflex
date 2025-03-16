import { Request, Response, NextFunction } from 'express';

export type TMiddleware<TOutput = any> = (
  req: Request,
  res: Response,
  next: NextFunction,
) => TOutput;
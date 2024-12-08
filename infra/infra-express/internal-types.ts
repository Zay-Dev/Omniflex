import { Locals, Response } from 'express';
import { BaseError } from '@omniflex/core/types';

export type TInfraExpressLocals = Locals & {
  user?: any;
  appType: string;
  requestId: string;
  error?: Error | BaseError;
  required: Record<string, any>;
};

export const asInfraLocals = (res: Response) => (res.locals) as TInfraExpressLocals;

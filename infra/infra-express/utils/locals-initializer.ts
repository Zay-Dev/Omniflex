import { v4 as uuidv4 } from 'uuid';
import { TInfraExpressLocals } from '../internal-types';

export const initializeLocals = (type: string): TInfraExpressLocals => ({
  appType: type,
  user: undefined,
  required: {},
  requestId: uuidv4(),
});

export const ensureLocals = (locals: Partial<TInfraExpressLocals>, type: string): TInfraExpressLocals => {
  const defaults = initializeLocals(type);

  return { ...defaults, ...locals };
};

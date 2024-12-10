import { ILogger } from '../types/logger';

export const createLogger = (): ILogger => {
  return {
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
    verbose: console.debug,
    silly: console.log,
  };
};
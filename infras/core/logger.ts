/* eslint-disable no-var */

import './';
import { ILogger } from '@omni-infra/types/logger';

type TGetThrowable = (message: string) => Error;

globalThis.logger = {
  error: console.error,
  info: console.info,
  warn: console.warn,
  debug: console.debug,
  silly: console.log.bind(null, "silly: "),
  verbose: console.log.bind(null, "verbose: "),
};

globalThis.getThrowable = (message: string) => {
  logger.error(message);
  return new Error(message);
};

declare global {
  var logger: ILogger;
  var getThrowable: TGetThrowable;
}
import "./";
import { ILogger } from '@omni-infra/types/logger';

type TGetThrowable = (message: string) => Error;

globalThis.logger = undefined!;
globalThis.getThrowable = (message: string) => {
  logger.error(message);
  return new Error(message);
};

declare global {
  var logger: ILogger;
  var getThrowable: TGetThrowable;
}
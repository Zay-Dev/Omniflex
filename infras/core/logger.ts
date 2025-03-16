import "./";
import { ILogger } from '@omni-infra/types/logger';

globalThis.logger = undefined!;

declare global {
  var logger: ILogger;
}
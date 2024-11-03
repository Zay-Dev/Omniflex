import { Logger } from 'winston';
import { ILogger, TOptions } from '@omniflex/core/types/logger';

type Level = 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'silly';

export class WinstonLogger implements ILogger {
  constructor(private _logger: Logger) { }

  error(messageOrOptions?: TOptions | string, options?: TOptions) {
    this._preLog('error', messageOrOptions, options);
  }

  warn(messageOrOptions?: TOptions | string, options?: TOptions) {
    this._preLog('warn', messageOrOptions, options);
  }

  info(messageOrOptions?: TOptions | string, options?: TOptions) {
    this._preLog('info', messageOrOptions, options);
  }

  debug(messageOrOptions?: TOptions | string, options?: TOptions) {
    this._preLog('debug', messageOrOptions, options);
  }

  verbose(messageOrOptions?: TOptions | string, options?: TOptions) {
    this._preLog('verbose', messageOrOptions, options);
  }

  silly(messageOrOptions?: TOptions | string, options?: TOptions) {
    this._preLog('silly', messageOrOptions, options);
  }

  private _preLog(
    level: Level,
    messageOrOptions?: TOptions | string,
    options?: TOptions,
  ) {
    if (typeof messageOrOptions === 'string') {
      this._log(level, messageOrOptions, options);
    } else {
      this._log(level, '', messageOrOptions);
    }
  }

  private _log(level: Level, message: string, options?: TOptions) {
    const { data, error, tags } = options || {};

    const serialized = [
      this._tagsToPrefix(tags),
      message || '',
      data ? JSON.stringify(data) : '',
      error ? error.stack : '',
    ].filter(Boolean).join(' ');

    this._logger[level](serialized);
  }

  private _tagsToPrefix(tags?: string | string[]) {
    if (!tags) return '';
    if (!Array.isArray(tags)) return `[${tags}]`;
    return tags.map(tag => `[${tag}]`).join(' ');
  }
}
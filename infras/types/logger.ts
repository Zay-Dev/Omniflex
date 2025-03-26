export type Level = 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'silly';

export type TOptions = {
  error?: Error;
  data?: Record<string, any>;
  tags?: string | string[];
};

export interface ILogMethod {
  (options?: TOptions): void;
  (message: string, options?: TOptions): void;
}

export interface ILogger {
  error: ILogMethod;
  warn: ILogMethod;
  info: ILogMethod;
  debug: ILogMethod;
  verbose: ILogMethod;
  silly: ILogMethod;
}
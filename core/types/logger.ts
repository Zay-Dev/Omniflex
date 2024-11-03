export type TOptions = {
  data?: any;
  error?: Error;
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
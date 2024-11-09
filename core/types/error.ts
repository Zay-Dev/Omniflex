export type TErrorOptions = {
  message: string;
  code: number;
  error?: string;
  errorCode?: string;
  data?: any;
};

export interface IErrorFactory {
  unauthorized(options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>): Error;
  forbidden(options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>): Error;
  notFound(message?: string, options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>): Error;
  badRequest(message?: string, options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>): Error;
  conflict(message?: string, options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>): Error;
  custom(message: string, code?: number, options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>): Error;
  create(options: TErrorOptions): Error;
}

export class BaseError extends Error {
  public readonly code: number;
  public readonly error?: string;
  public readonly errorCode?: string;
  public readonly data?: any;

  constructor(options: TErrorOptions) {
    super(options.message);

    this.code = options.code;
    this.error = options.error;
    this.errorCode = options.errorCode || options.error;
    this.data = options.data;

    Object.setPrototypeOf(this, BaseError.prototype);
  }
}
import { BaseError, IErrorFactory, TErrorOptions } from './types/error';

class ErrorFactory implements IErrorFactory {
  unauthorized(options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>) {
    return this.create({
      code: 401,
      message: 'Unauthorized',
      ...options
    });
  }

  forbidden(options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>) {
    return this.create({
      code: 403,
      message: 'Forbidden',
      ...options
    });
  }

  notFound(message: string = "Not Found", options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>) {
    return this.create({
      message,
      code: 404,
      ...options
    });
  }

  badRequest(message: string = "Bad Request", options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>) {
    return this.create({
      message,
      code: 400,
      ...options
    });
  }

  conflict(message: string = "Conflict", options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>) {
    return this.create({
      message,
      code: 409,
      ...options
    });
  }

  custom(message: string, code: number = 500, options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>) {
    return this.create({
      code,
      message,
      ...options
    });
  }

  create(options: TErrorOptions) {
    return new BaseError(options);
  }
}

export const errorFactory = new ErrorFactory();
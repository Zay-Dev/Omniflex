type TErrors = typeof errors;

type TErrorOptions = {
  message: string;
  code: number;
  error?: string;
  errorCode?: string;
  data?: any;
};

type TPartialOptions = Partial<Omit<TErrorOptions, 'code' | 'message'>>;

export class ServerError extends Error {
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

    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

const errors = {
  ServerError,

  unauthorized: (options?: TPartialOptions) => {
    return new ServerError({
      code: 401,
      message: 'Unauthorized',
      ...options
    });
  },

  forbidden: (options?: TPartialOptions) => {
    return new ServerError({
      code: 403,
      message: 'Forbidden',
      ...options
    });
  },

  notFound: (message: string = "Not Found", options?: TPartialOptions) => {
    return new ServerError({
      message,
      code: 404,
      ...options
    });
  },

  badRequest: (message: string = "Bad Request", options?: TPartialOptions) => {
    return new ServerError({
      message,
      code: 400,
      ...options
    });
  },

  conflict: (message: string = "Conflict", options?: TPartialOptions) => {
    return new ServerError({
      message,
      code: 409,
      ...options
    });
  },

  custom: (message: string, code: number = 500, options?: TPartialOptions) => {
    return new ServerError({
      code,
      message,
      ...options
    });
  },
};

globalThis.errors = errors;

declare global {
  var errors: TErrors;
}
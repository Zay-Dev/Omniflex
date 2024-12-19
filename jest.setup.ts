jest.mock('@omniflex/core', () => {
  class BaseError extends Error {
    constructor(options: { message: string; code: number; error?: string; }) {
      super(options.message);
      this.code = options.code;
      this.error = options.error;
      Object.setPrototypeOf(this, BaseError.prototype);
    }

    public readonly code: number;
    public readonly error?: string;
  }

  const errorFactory = {
    custom: (message: string, code = 500) => new BaseError({ message, code }),
    notFound: (message = 'Not Found') => new BaseError({ message, code: 404 }),
    badRequest: (message = 'Bad Request') => new BaseError({ message, code: 400 }),
    unauthorized: () => new BaseError({ message: 'Unauthorized', code: 401 }),
    forbidden: () => new BaseError({ message: 'Forbidden', code: 403 })
  };

  return { 
    Utils: {
      tryAction: async (action: () => Promise<any> | any, options?: { next?: (error: any) => void; }) => {
        try {
          return await action();
        } catch (error) {
          if (options?.next) {
            options.next(error);
          } else {
            throw error;
          }
        }
      },
    },
    logger: {
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn()
    },
    errors: errorFactory,
    Containers: {
      configAs: jest.fn().mockReturnValue({
        logging: {
          exposeErrorDetails: false
        }
      }),
      appContainerAs: jest.fn().mockReturnValue({
        sequelize: {},
        mongoose: {}
      })
    },
    handleUncaughtException: jest.fn(),
    BaseError,
    modulesSchemas: {}
  };
});
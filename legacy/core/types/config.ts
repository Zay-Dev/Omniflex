export type TBaseConfig = {
  env: 'development' | 'production' | 'test';

  logging: {
    exposeErrorDetails: boolean;
    level: 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'silly';
  };

  server: {
    requestTimeoutInSeconds: number;
  };
};
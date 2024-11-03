export type TBaseConfig = {
  env: 'development' | 'production' | 'test';

  logging: {
    level: 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'silly';
  };

  server: {
    requestTimeoutInSeconds: number;
  };
};
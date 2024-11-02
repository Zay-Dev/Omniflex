import {
  Router,
  Express,
  RequestHandler
} from 'express';

export type TServerOptions = {
  middleware?: {
    beforeRoutes?: Array<RequestHandler>;
    fallbacks?: Array<RequestHandler>;
  };

  auth?: RequestHandler;
};

export type TBaseServer = {
  port: number;
  type: string;

  options?: TServerOptions;
};

export type TServer = TBaseServer & {
  server: Express;
  getRouters: () => Record<string, Router>;
};

export type TOptions = {
  servers: TServer[];
  middleware?: TServerOptions['middleware'];
};

export type Locals<TUser = any> = {
  user?: TUser;
  appType: string;
  requestId: string;
};

export type THydratedRouter = Router & {
  useAuthRouter: () => {
    get: (path: string, ...args: any[]) => Router;
    post: (path: string, ...args: any[]) => Router;
    put: (path: string, ...args: any[]) => Router;
    delete: (path: string, ...args: any[]) => Router;
    patch: (path: string, ...args: any[]) => Router;
  };
};
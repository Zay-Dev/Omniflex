import { Express, Router, RequestHandler } from 'express';
import { logger } from '@omniflex/core';
import { TServer } from './types';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
};

jest.mock('@omniflex/core', () => ({
  logger: mockLogger,
}));

// Mock Express module
function createMockRouter() {
  return {
    use: jest.fn(),
  } as unknown as Router;
}

function createMockExpressServer() {
  return {
    request: {},
    response: {},
    init: jest.fn(),
    defaultConfiguration: jest.fn(),
    use: jest.fn(),
    listen: jest.fn(),
  } as unknown as Express;
}

type TExpressModule = {
  (): Express;
  Router: () => Router;
  json: () => RequestHandler;
};

jest.mock('express', () => {
  const mockExpress = jest.fn().mockReturnValue(createMockExpressServer()) as unknown as TExpressModule;
  mockExpress.Router = jest.fn().mockReturnValue(createMockRouter());
  mockExpress.json = jest.fn().mockReturnValue((req, res, next) => next());
  return mockExpress;
});

jest.mock('http', () => ({
  createServer: jest.fn().mockReturnValue({
    listen: jest.fn().mockImplementation((port, callback) => {
      callback();
      return 'server-instance';
    }),
  }),
}));

jest.mock('./middlewares/index', () => ({
  applyMiddlewares: jest.fn().mockImplementation((app, server, options, useRouters) => {
    if (useRouters) useRouters();
    return app;
  }),
}));

const mockBindAsyncFunctionDefaultErrorHandler = jest.fn();
jest.mock('./helpers/routers', () => ({
  bindAsyncFunctionDefaultErrorHandler: mockBindAsyncFunctionDefaultErrorHandler
}));

describe('run-express', () => {
  let mockExpressServer: Express;
  let mockRouter: Router;
  let createServer: any;
  let runExpress: any;
  let applyMiddlewares: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger.error.mockClear();
    jest.isolateModules(() => {
      mockExpressServer = require('express')();
      mockRouter = require('express').Router();
      createServer = require('./run-express').createServer;
      runExpress = require('./run-express').runExpress;
      applyMiddlewares = require('./middlewares/index').applyMiddlewares;
    });
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('createServer', () => {
    it('[EXPR-C0040] should return express instance', () => {
      // Verify createServer is a function
      expect(typeof createServer).toBe('function');
      
      // Verify it returns an Express instance when called
      const app = createServer();
      expect(app).toHaveProperty('use');
      expect(app).toHaveProperty('listen');
      expect(app).toEqual(mockExpressServer);
    });
  });

  describe('runExpress', () => {
    it('[EXPR-R0090] should start server with default config', async () => {
      const server: TServer = {
        type: 'test',
        port: 3000,
        server: mockExpressServer,
        getRouters: () => ({}),
      };

      await runExpress({ servers: [server] });

      expect(applyMiddlewares).toHaveBeenCalledWith(
        mockExpressServer,
        server,
        {},
        expect.any(Function)
      );
    });

    it('[EXPR-R0100] should apply middlewares and bind routers', async () => {
      const routers = {
        '/test': mockRouter,
      };

      const server: TServer = {
        type: 'test',
        port: 3000,
        server: mockExpressServer,
        getRouters: () => routers,
      };

      await runExpress({ servers: [server] });

      // Verify middleware application
      expect(applyMiddlewares).toHaveBeenCalled();

      // Get the useRouters callback
      const useRoutersCallback = (applyMiddlewares as jest.Mock).mock.calls[0][3];
      useRoutersCallback();

      // Verify router binding
      expect(mockExpressServer.use).toHaveBeenCalledWith('/test', mockRouter);
      expect(mockBindAsyncFunctionDefaultErrorHandler).toHaveBeenCalledWith(mockRouter);
    });

    it('[EXPR-R0110] should handle noServer option', async () => {
      const server: TServer = {
        type: 'test',
        port: 3000,
        server: mockExpressServer,
        getRouters: () => ({}),
        noServer: true,
      };

      const result = await runExpress({ servers: [server] });
      expect(result[0].server).toBeNull();
    });

    it('[EXPR-R0120] should start multiple servers', async () => {
      const server1: TServer = {
        type: 'test1',
        port: 3000,
        server: mockExpressServer,
        getRouters: () => ({}),
      };

      const server2: TServer = {
        type: 'test2',
        port: 3001,
        server: mockExpressServer,
        getRouters: () => ({}),
      };

      const result = await runExpress({ servers: [server1, server2] });
      expect(result).toHaveLength(2);
    });

    it('[EXPR-R0130] should apply after middlewares', async () => {
      const afterMiddleware: RequestHandler = jest.fn();
      const server: TServer = {
        type: 'test',
        port: 3000,
        server: mockExpressServer,
        getRouters: () => ({}),
      };

      await runExpress({
        servers: [server],
        middlewares: {
          after: [afterMiddleware],
        },
      });

      expect(applyMiddlewares).toHaveBeenCalledWith(
        mockExpressServer,
        server,
        {
          after: [afterMiddleware],
        },
        expect.any(Function)
      );
    });
  });

  describe('startServer', () => {
    it('[EXPR-E0010] should handle null app', async () => {
      const server: TServer = {
        type: 'test',
        port: 3000,
        server: null as unknown as Express,
        getRouters: () => ({}),
      };

      const result = await runExpress({ servers: [server] });
      expect(result[0].server).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cannot start server: null reference to app',
        { tags: 'test' }
      );
    });

    it('[EXPR-E0020] should handle missing type', async () => {
      const server = {
        type: '',
        port: 3000,
        server: mockExpressServer,
        getRouters: () => ({}),
      } as TServer;

      const result = await runExpress({ servers: [server] });
      expect(result[0].server).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cannot start server: type is not defined',
        { tags: '' }
      );
    });

    it('[EXPR-E0030] should handle invalid port', async () => {
      const server = {
        type: 'test',
        port: 0,
        server: mockExpressServer,
        getRouters: () => ({}),
      } as TServer;

      const result = await runExpress({ servers: [server] });
      expect(result[0].server).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cannot start server: invalid port (received 0)',
        { tags: 'test' }
      );
    });
  });
}); 
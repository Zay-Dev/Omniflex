import '@omni-infra/core';
import { Router, RequestHandler } from 'express';
import * as Routers from './routers';

describe('Express/Routers', () => {
  describe('get', () => {
    it('[Express/Routers-0010] should return an Express Router instance', () => {
      const router = Routers.get();

      expect(router).toBeDefined();
      expect(typeof router.use).toBe('function');
      expect(typeof router.get).toBe('function');
      expect(typeof router.post).toBe('function');
    });
  });

  describe('getHydrated', () => {
    it('[Express/Routers-0020] should return a router with useMiddlewares method', () => {
      const router = Routers.getHydrated();

      expect(router).toBeDefined();
      expect(typeof router.useMiddlewares).toBe('function');
    });

    it('[Express/Routers-0030] useMiddlewares should apply middleware to all route methods', () => {
      const router = Routers.getHydrated();
      const middleware = jest.fn((req, res, next) => next());
      const handler = jest.fn();

      const nestedRouter = router.useMiddlewares([middleware]);

      // Test each HTTP method
      const methods = ['get', 'post', 'put', 'delete', 'patch'];
      methods.forEach(method => {
        nestedRouter[method]('/test', handler);

        // Get the registered route and extract its stack
        const routes = (nestedRouter as any).stack.filter(
          (layer: any) => layer.route && layer.route.path === '/test'
        );

        expect(routes.length).toBeGreaterThan(0);
        expect(routes[0].route.stack.length).toBe(2); // middleware + handler
      });
    });

    it('[Express/Routers-0040] useMiddlewares should filter out falsy middleware', () => {
      const router = Routers.getHydrated();
      const middleware = jest.fn((req, res, next) => next());
      const handler = jest.fn();

      // Cast the array to RequestHandler[] to handle null and undefined
      const middlewares = [middleware, null, undefined] as unknown as RequestHandler[];
      const nestedRouter = router.useMiddlewares(middlewares);

      nestedRouter.get('/test', handler);

      // Get the registered route and extract its stack
      const routes = (nestedRouter as any).stack.filter(
        (layer: any) => layer.route && layer.route.path === '/test'
      );

      expect(routes[0].route.stack.length).toBe(2); // Only middleware + handler
    });
  });

  describe('bindUncaughtRouterErrorHandler', () => {
    let mockRouter: any;
    let mockLayer: any;
    let mockRoute: any;
    let mockLoggerSilly: jest.SpyInstance;
    let mockLoggerError: jest.SpyInstance;

    beforeEach(() => {
      mockLoggerSilly = jest.spyOn(globalThis.logger, 'silly').mockImplementation();
      mockLoggerError = jest.spyOn(globalThis.logger, 'error').mockImplementation();

      mockLayer = {
        handle: jest.fn(),
      };

      mockRoute = {
        path: '/test',
        stack: [mockLayer],
      };

      mockRouter = {
        stack: [
          {
            name: 'bound dispatch',
            route: mockRoute,
          },
        ],
      };
    });

    afterEach(() => {
      mockLoggerSilly.mockRestore();
      mockLoggerError.mockRestore();
    });

    it('[Express/Routers-0050] should wrap route handlers with error catching', () => {
      const handle = mockLayer.handle;
      Routers.bindUncaughtRouterErrorHandler(mockRouter as Router, 30);

      // Verify the layer.handle was replaced
      expect(mockLayer.handle).not.toBe(handle);
    });

    it('[Express/Routers-0060] should handle errors in route handlers', async () => {
      const originalHandler = jest.fn().mockImplementation(async function () {
        throw new Error('Test error');
      });

      mockLayer.handle = originalHandler;

      Routers.bindUncaughtRouterErrorHandler(mockRouter as Router, 30);

      const mockReq = { url: '/test', method: 'GET', params: {}, query: {}, body: {} };
      const mockRes = {};
      const mockNext = jest.fn();

      // Call the wrapped handler
      await mockLayer.handle(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockLoggerError).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(errors.ServerError);
    });

    it('[Express/Routers-0080] should handle nested routers', () => {
      const nestedRouter = {
        stack: [
          {
            name: 'bound dispatch',
            route: {
              path: '/nested',
              stack: [{ handle: jest.fn() }],
            },
          },
        ],
      };
      const handle = nestedRouter.stack[0].route.stack[0].handle;

      mockRouter.stack.push({
        name: 'router',
        handle: nestedRouter,
      });

      Routers.bindUncaughtRouterErrorHandler(mockRouter as Router, 30);

      // Verify the nested router was also handled
      expect(nestedRouter.stack[0].route.stack[0].handle).not.toBe(handle);
    });

    it('[Express/Routers-0090] should handle unknown layer types', () => {
      mockRouter.stack.push({
        name: 'unknown',
        handle: jest.fn(),
      });

      Routers.bindUncaughtRouterErrorHandler(mockRouter as Router, 30);

      expect(mockLoggerSilly).toHaveBeenCalled();
    });

    it('[Express/Routers-0100] should set timeout for handlers without promise', () => {
      jest.useFakeTimers();

      const originalHandler = jest.fn();
      mockLayer.handle = originalHandler;

      Routers.bindUncaughtRouterErrorHandler(mockRouter as Router, 30);

      const mockReq = { url: '/test', method: 'GET', params: {}, query: {}, body: {} };
      const mockRes = { headersSent: false };
      const mockNext = jest.fn();

      // Call the wrapped handler
      mockLayer.handle(mockReq, mockRes, mockNext);

      // Fast forward 30 seconds
      jest.advanceTimersByTime(30000);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(errors.ServerError);
      expect(mockNext.mock.calls[0][0].code).toBe(408);

      jest.useRealTimers();
    });
  });
});
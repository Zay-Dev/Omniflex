import { mockRequest, mockResponse, mockNext } from '../../mock-utils';
import { getExpressRouter, nextRouteIf } from '../../../helpers/routers';
import { RequestHandler } from 'express';

describe('Router Helpers', () => {
  describe('getExpressRouter', () => {
    test('returns router with useMiddlewares function', () => {
      const router = getExpressRouter();
      expect(router).toBeDefined();
      expect(router.useMiddlewares).toBeDefined();
      expect(typeof router.useMiddlewares).toBe('function');
    });

    test('useMiddlewares applies middleware to all HTTP methods', () => {
      const router = getExpressRouter();
      const middleware = jest.fn((req, res, next) => next());
      const nestedRouter = router.useMiddlewares([middleware]);

      const methods = ['get', 'post', 'put', 'delete', 'patch'];
      methods.forEach(method => {
        expect(nestedRouter[method]).toBeDefined();
        expect(typeof nestedRouter[method]).toBe('function');
      });
    });

    test('useMiddlewares correctly chains middleware and handlers', async () => {
      const router = getExpressRouter();
      const middleware1 = jest.fn((req, res, next) => next());
      const middleware2 = jest.fn((req, res, next) => next());
      const handler = jest.fn((req, res) => res.json({ success: true }));

      const nestedRouter = router.useMiddlewares([middleware1, middleware2]);
      const path = '/test';
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      nestedRouter.get(path, handler);

      const route = (nestedRouter as any).stack.find((layer: any) =>
        layer.route && layer.route.path === path
      );

      expect(route).toBeDefined();
      expect(route.route.stack.length).toBe(3);

      await Promise.all(route.route.stack.map((layer: any) =>
        layer.handle(req, res, next)
      ));

      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
    });

    test('useMiddlewares filters out falsy middleware', () => {
      const router = getExpressRouter();
      const middleware1 = jest.fn((req, res, next) => next());
      const middleware2 = jest.fn((req, res, next) => next());

      // Create an array with a falsy value by using array spread and filter
      const middlewares = [middleware1, middleware2];
      const falsyMiddlewares = [...middlewares, undefined as unknown as RequestHandler];

      const nestedRouter = router.useMiddlewares(falsyMiddlewares);
      const handler = jest.fn((req, res) => res.json({}));

      nestedRouter.get('/test', handler);

      // Verify only valid middlewares are applied
      const route = (nestedRouter as any).stack.find((layer: any) =>
        layer.route && layer.route.path === '/test'
      );

      expect(route.route.stack.length).toBe(3); // 2 middleware + 1 handler
    });
  });

  describe('nextRouteIf', () => {
    test('calls next("route") when condition is true', async () => {
      const condition = jest.fn().mockResolvedValue(true);
      const middleware = nextRouteIf(condition);
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      await middleware(req, res, next);

      expect(condition).toHaveBeenCalledWith(req, res, next);
      expect(next).toHaveBeenCalledWith('route');
    });

    test('calls next() when condition is false', async () => {
      const condition = jest.fn().mockResolvedValue(false);
      const middleware = nextRouteIf(condition);
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      await middleware(req, res, next);

      expect(condition).toHaveBeenCalledWith(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    test('works with synchronous condition function', async () => {
      const condition = jest.fn().mockReturnValue(true);
      const middleware = nextRouteIf(condition);
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      await middleware(req, res, next);

      expect(condition).toHaveBeenCalledWith(req, res, next);
      expect(next).toHaveBeenCalledWith('route');
    });

    test('handles condition function throwing error', async () => {
      const error = new Error('Test error');
      const condition = jest.fn().mockRejectedValue(error);
      const middleware = nextRouteIf(condition);
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      await expect(middleware(req, res, next)).rejects.toThrow(error);
      expect(condition).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
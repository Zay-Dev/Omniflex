import { BaseExpressController } from './base-controller'
import { createMockRequest, createMockResponse } from '../test-utils'
import { NextFunction } from 'express'
import { TInfraExpressLocals } from '../internal-types'

// Mock @omniflex/core
jest.mock('@omniflex/core', () => ({
  errors: {
    notFound: (type?: string) => {
      const error = new Error(type ? `${type} Not Found` : 'Not Found');
      error.name = 'BaseError';
      return error;
    },
    forbidden: () => {
      const error = new Error('Forbidden');
      error.name = 'BaseError';
      return error;
    }
  },
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
  Utils: {
    tryAction: jest.fn().mockImplementation(async (action) => action()),
  }
}));

// Mock express utils
jest.mock('./express', () => ({
  respondOne: (res: any, data: any) => res.json({ data }),
  respondRequired: (res: any, locals: any, key: string) => res.json({ data: locals.required[key] }),
  respondMany: (res: any, data: any[], total?: number) => res.json({ data, total: total || data.length }),
}));

// Mock locals initializer
jest.mock('./locals-initializer', () => ({
  ensureLocals: (locals: any) => locals,
  initializeLocals: () => ({
    appType: 'test',
    user: undefined,
    required: {},
    requestId: 'test-id',
  }),
}));

class TestController extends BaseExpressController<TInfraExpressLocals> {
  public testRespondOne<T>(data: T) {
    return this.respondOne(data)
  }

  public testRespondMany<T>(data: T[]) {
    return this.respondMany(data)
  }

  public testRespondRequired(key: string) {
    return this.respondRequired(key)
  }

  public testThrowNotFound(type?: string) {
    return this.throwNotFound(type)
  }

  public testThrowForbidden() {
    return this.throwForbidden()
  }
}

describe('BaseExpressController', () => {
  let controller: TestController
  let req: any
  let res: any
  let next: jest.Mock<NextFunction>

  beforeEach(() => {
    req = createMockRequest()
    res = createMockResponse()
    next = jest.fn() as jest.Mock<NextFunction>
    controller = new TestController(req, res, next)
  })

  describe('response formatting', () => {
    it('[UTIL-R0080] should format single item response', () => {
      const testData = { id: 1 }
      controller.testRespondOne(testData)
      expect(res.json).toHaveBeenCalledWith({ data: testData })
    })

    it('[UTIL-R0090] should format array response with total', () => {
      const testData = [{ id: 1 }, { id: 2 }]
      controller.testRespondMany(testData)
      expect(res.json).toHaveBeenCalledWith({
        data: testData,
        total: 2
      })
    })

    it('[UTIL-R0100] should format required response', () => {
      const key = 'user'
      res.locals.required = { [key]: { id: 1 } }
      controller.testRespondRequired(key)
      expect(res.json).toHaveBeenCalledWith({ data: { id: 1 } })
    })
  })

  describe('error handling', () => {
    it('[UTIL-E0040] should throw not found error', () => {
      expect(() => controller.testThrowNotFound('User'))
        .toThrow('User Not Found');
    });

    it('[UTIL-E0050] should throw forbidden error', () => {
      expect(() => controller.testThrowForbidden())
        .toThrow('Forbidden');
    });
  })
}) 
/**
 * Jest setup file for @omniflex/infra-express workspace
 * This setup provides Express-specific test utilities and mock cleanup
 */

import { Request, Response, NextFunction } from 'express';
import { TInfraExpressLocals } from '../internal-types';
import { BaseError, TErrorOptions } from '@omniflex/core/types/error';

// Error classes for testing
class NotFoundError extends BaseError {
  constructor(message?: string, options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>) {
    super({
      message: message || 'Not Found',
      code: 404,
      ...options,
    });
  }
}

class BadRequestError extends BaseError {
  constructor(message?: string, options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>) {
    super({
      message: message || 'Bad Request',
      code: 400,
      ...options,
    });
  }
}

class ConflictError extends BaseError {
  constructor(message?: string, options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>) {
    super({
      message: message || 'Conflict',
      code: 409,
      ...options,
    });
  }
}

class CustomError extends BaseError {
  constructor(message: string, code: number, options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>) {
    super({
      message,
      code,
      ...options,
    });
    this.name = 'BaseError';
  }
}

// Error factory for testing
export const errors = {
  notFound: (message?: string, options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>) => 
    new NotFoundError(message, options),
  badRequest: (message?: string, options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>) => 
    new BadRequestError(message, options),
  conflict: (message?: string, options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>) => 
    new ConflictError(message, options),
  custom: (message: string, code = 500, options?: Partial<Omit<TErrorOptions, 'code' | 'message'>>) =>
    new CustomError(message, code, options),
};

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Reset all mocks after each test
afterEach(() => {
  jest.resetAllMocks();
});

// Test utilities for creating Express mocks
export const createMockRequest = (overrides = {}) => ({
  params: {},
  query: {},
  body: {},
  headers: {},
  ...overrides,
}) as Request;

export const createMockResponse = () => {
  const res = {} as Response;
  res.locals = {
    appType: 'test',
    requestId: 'test-request-id',
    required: {},
  } as TInfraExpressLocals;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  return res;
};

export const createMockNext = () => jest.fn() as NextFunction;

// Mock repository factory
export const createMockRepository = () => ({
  findOne: jest.fn(),
  exists: jest.fn(),
  isValidPrimaryKey: jest.fn().mockReturnValue(true),
});

// Mock service factory
export const createMockService = () => ({
  findOne: jest.fn(),
  exists: jest.fn(),
});

// Export test utilities
export const TestUtils = {
  createMockRequest,
  createMockResponse,
  createMockNext,
  createMockRepository,
  createMockService,
}; 
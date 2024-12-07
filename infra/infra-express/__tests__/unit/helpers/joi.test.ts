import Joi from 'joi';
import { errors } from '@omniflex/core';
import { mockRequest } from '../../mock-utils';
import { validateRequestBody, validateRequestParams } from '../../../helpers/joi';
import { BaseError } from '@omniflex/core/types/error';

// Mock the error factory to create actual BaseError instances
jest.mock('@omniflex/core', () => ({
  errors: {
    badRequest: (message: string) => new BaseError({ message, code: 400 })
  }
}));

describe('Joi Helpers', () => {
  describe('validateRequestBody', () => {
    const schema = Joi.object({
      name: Joi.string().required(),
      age: Joi.number().integer().min(0)
    });

    test('validates and returns valid request body', () => {
      const req = mockRequest();
      req.body = { name: 'John', age: 25 };

      const { value } = validateRequestBody(req, schema);
      expect(value).toEqual(req.body);
    });

    test('reassigns validated value to request body by default', () => {
      const req = mockRequest();
      req.body = { name: 'John', age: '25' };

      validateRequestBody(req, schema);
      expect(req.body).toEqual({ name: 'John', age: 25 });
    });

    test('does not reassign when noReassign is true', () => {
      const req = mockRequest();
      const originalBody = { name: 'John', age: '25' };
      req.body = { ...originalBody };

      const { value } = validateRequestBody(req, schema, { noReassign: true });
      expect(req.body).toEqual(originalBody);
      expect(value).toEqual({ name: 'John', age: 25 });
    });

    test('throws error for invalid request body', () => {
      const req = mockRequest();
      req.body = { age: -1 };

      try {
        validateRequestBody(req, schema);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.code).toBe(400);
        expect(error.message).toBe('"name" is required. "age" must be greater than or equal to 0');
      }
    });

    test('handles empty request body', () => {
      const req = mockRequest();
      req.body = {};

      try {
        validateRequestBody(req, schema);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.code).toBe(400);
        expect(error.message).toBe('"name" is required');
      }
    });

    test('validates complex nested objects', () => {
      const complexSchema = Joi.object({
        user: Joi.object({
          name: Joi.string().required(),
          contacts: Joi.array().items(
            Joi.object({
              type: Joi.string().valid('email', 'phone').required(),
              value: Joi.string().required()
            })
          )
        }).required()
      });

      const req = mockRequest();
      req.body = {
        user: {
          name: 'John',
          contacts: [
            { type: 'email', value: 'john@example.com' },
            { type: 'phone', value: '1234567890' }
          ]
        }
      };

      const { value } = validateRequestBody(req, complexSchema);
      expect(value).toEqual(req.body);
    });
  });

  describe('validateRequestParams', () => {
    const schema = Joi.object({
      id: Joi.string().required(),
      type: Joi.string().valid('user', 'admin')
    });

    test('validates valid request params', () => {
      const req = mockRequest();
      req.params = { id: '123', type: 'user' };

      expect(() => validateRequestParams(req, schema))
        .not.toThrow();
    });

    test('throws error for invalid request params', () => {
      const req = mockRequest();
      req.params = { type: 'invalid' };

      try {
        validateRequestParams(req, schema);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.code).toBe(400);
        expect(error.message).toBe('"id" is required. "type" must be one of [user, admin]');
      }
    });

    test('handles empty request params', () => {
      const req = mockRequest();
      req.params = {};

      try {
        validateRequestParams(req, schema);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.code).toBe(400);
        expect(error.message).toBe('"id" is required');
      }
    });

    test('validates with optional params', () => {
      const req = mockRequest();
      req.params = { id: '123' };

      expect(() => validateRequestParams(req, schema))
        .not.toThrow();
    });

    test('throws error for invalid param values', () => {
      const req = mockRequest();
      req.params = { id: '123', type: 'superuser' };

      try {
        validateRequestParams(req, schema);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.code).toBe(400);
        expect(error.message).toBe('"type" must be one of [user, admin]');
      }
    });
  });
}); 
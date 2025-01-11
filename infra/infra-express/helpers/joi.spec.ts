import Joi from 'joi'
import { errors } from '@omniflex/core'
import { createMockRequest } from '../jest.setup'
import { validateRequestBody, validateRequestParams } from './joi'
import { BaseError } from '@omniflex/core/types/error'

// Mock the error factory to create actual BaseError instances
jest.mock('@omniflex/core', () => ({
  errors: {
    badRequest: (message: string) => new BaseError({ message, code: 400 })
  }
}))

describe('Joi Helpers', () => {
  describe('validateRequestBody', () => {
    const schema = Joi.object({
      name: Joi.string().required(),
      age: Joi.number().integer().min(0)
    })

    it('[HELP-V0010] should validate and return valid request body', () => {
      const req = createMockRequest()
      req.body = { name: 'John', age: 25 }

      const { value } = validateRequestBody(req, schema)
      expect(value).toEqual(req.body)
    })

    it('[HELP-V0020] should reassign validated value to request body by default', () => {
      const req = createMockRequest()
      req.body = { name: 'John', age: '25' }

      validateRequestBody(req, schema)
      expect(req.body).toEqual({ name: 'John', age: 25 })
    })

    it('[HELP-V0030] should not reassign when noReassign is true', () => {
      const req = createMockRequest()
      const originalBody = { name: 'John', age: '25' }
      req.body = { ...originalBody }

      const { value } = validateRequestBody(req, schema, { noReassign: true })
      expect(req.body).toEqual(originalBody)
      expect(value).toEqual({ name: 'John', age: 25 })
    })

    it('[HELP-E0010] should throw error for invalid request body', () => {
      const req = createMockRequest()
      req.body = { age: -1 }

      expect(() => validateRequestBody(req, schema))
        .toThrow('"name" is required. "age" must be greater than or equal to 0')
    })

    it('[HELP-E0020] should handle empty request body', () => {
      const req = createMockRequest()
      req.body = {}

      expect(() => validateRequestBody(req, schema))
        .toThrow('"name" is required')
    })

    it('[HELP-V0040] should validate complex nested objects', () => {
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
      })

      const req = createMockRequest()
      req.body = {
        user: {
          name: 'John',
          contacts: [
            { type: 'email', value: 'john@example.com' },
            { type: 'phone', value: '1234567890' }
          ]
        }
      }

      const { value } = validateRequestBody(req, complexSchema)
      expect(value).toEqual(req.body)
    })
  })

  describe('validateRequestParams', () => {
    const schema = Joi.object({
      id: Joi.string().required(),
      type: Joi.string().valid('user', 'admin')
    })

    it('[HELP-V0050] should validate valid request params', () => {
      const req = createMockRequest()
      req.params = { id: '123', type: 'user' }

      expect(() => validateRequestParams(req, schema))
        .not.toThrow()
    })

    it('[HELP-E0030] should throw error for invalid request params', () => {
      const req = createMockRequest()
      req.params = { type: 'invalid' }

      expect(() => validateRequestParams(req, schema))
        .toThrow('"id" is required. "type" must be one of [user, admin]')
    })

    it('[HELP-E0040] should handle empty request params', () => {
      const req = createMockRequest()
      req.params = {}

      expect(() => validateRequestParams(req, schema))
        .toThrow('"id" is required')
    })

    it('[HELP-V0060] should validate with optional params', () => {
      const req = createMockRequest()
      req.params = { id: '123' }

      expect(() => validateRequestParams(req, schema))
        .not.toThrow()
    })

    it('[HELP-E0050] should throw error for invalid param values', () => {
      const req = createMockRequest()
      req.params = { id: '123', type: 'superuser' }

      expect(() => validateRequestParams(req, schema))
        .toThrow('"type" must be one of [user, admin]')
    })
  })
}) 
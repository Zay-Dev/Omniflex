import { schemas } from './joi.schemas';

describe('Joi Schemas', () => {
  describe('refreshToken', () => {
    it('[SCHEMA-V0010] should validate valid refresh token', () => {
      const data = {
        refreshToken: 'valid-refresh-token',
      };

      const result = schemas.refreshToken.validate(data);

      expect(result.error).toBeFalsy();
      expect(result.value).toEqual(data);
    });

    it('[SCHEMA-V0020] should reject missing refresh token', () => {
      const data = {};

      const result = schemas.refreshToken.validate(data);

      expect(result.error).toBeTruthy();
      expect(result.error?.details[0].type).toBe('any.required');
    });

    it('[SCHEMA-V0030] should reject non-string refresh token', () => {
      const data = {
        refreshToken: 123,
      };

      const result = schemas.refreshToken.validate(data);

      expect(result.error).toBeTruthy();
      expect(result.error?.details[0].type).toBe('string.base');
    });
  });
});
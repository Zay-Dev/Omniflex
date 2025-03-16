import { schemaLogin, schemaLoginWithEmail } from './login.schema';

describe('Login Schemas', () => {
  describe('schemaLogin', () => {
    const validData = {
      username: 'testuser',
      password: 'Password123',
    };

    it('[SCHEMA-V0150] should validate valid login data', () => {
      const { error, value } = schemaLogin.validate(validData);
      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('[SCHEMA-V0160] should require username', () => {
      const { error } = schemaLogin.validate({
        password: 'Password123',
      });
      expect(error?.details[0].message).toContain('"username" is required');
    });

    it('[SCHEMA-V0170] should require password', () => {
      const { error } = schemaLogin.validate({
        username: 'testuser',
      });
      expect(error?.details[0].message).toContain('"password" is required');
    });

    it('[SCHEMA-V0180] should trim whitespace', () => {
      const { error, value } = schemaLogin.validate({
        username: ' testuser ',
        password: ' Password123 ',
      });
      expect(error).toBeUndefined();
      expect(value).toEqual({
        username: 'testuser',
        password: 'Password123',
      });
    });
  });

  describe('schemaLoginWithEmail', () => {
    const validData = {
      email: 'test@example.com',
      password: 'Password123',
    };

    it('[SCHEMA-V0190] should validate valid login with email data', () => {
      const { error, value } = schemaLoginWithEmail.validate(validData);
      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('[SCHEMA-V0200] should require email', () => {
      const { error } = schemaLoginWithEmail.validate({
        password: 'Password123',
      });
      expect(error?.details[0].message).toContain('"email" is required');
    });

    it('[SCHEMA-V0210] should validate email format', () => {
      const { error } = schemaLoginWithEmail.validate({
        email: 'invalid-email',
        password: 'Password123',
      });
      expect(error?.details[0].message).toContain('"email" must be a valid email');
    });

    it('[SCHEMA-V0220] should convert email to lowercase', () => {
      const { error, value } = schemaLoginWithEmail.validate({
        email: 'TEST@EXAMPLE.COM',
        password: 'Password123',
      });
      expect(error).toBeUndefined();
      expect(value.email).toBe('test@example.com');
    });
  });
}); 
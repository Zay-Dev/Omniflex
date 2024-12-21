import {
  schemaLogin,
  schemaLoginWithEmail,
  schemaRegister,
  schemaRegisterWithEmail,
} from '../../';

jest.mock('../../containers', () => ({
  resolve: jest.fn().mockReturnValue({
    users: {},
    profiles: {},
    passwords: {},
    loginAttempts: {}
  })
}));

describe('User Schemas', () => {
  describe('register schema', () => {
    const validData = {
      username: 'testuser',
      password: 'Password123',
      repeatPassword: 'Password123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      mobileNumber: '+1234567890'
    };

    it('should validate complete valid data', () => {
      const { error, value } = schemaRegister.validate(validData);
      expect(error).toBeUndefined();
      expect(value.repeatPassword).toBeUndefined();
    });

    it('should require username', () => {
      const { error } = schemaRegister.validate({
        ...validData,
        username: undefined
      });
      expect(error?.details[0].message).toContain('"username" is required');
    });

    it('should validate username format', () => {
      const { error } = schemaRegister.validate({
        ...validData,
        username: 'a'
      });
      expect(error?.details[0].message).toContain('"username" length must be at least 3 characters long');
    });

    it('should validate password complexity', () => {
      const { error } = schemaRegister.validate({
        ...validData,
        password: 'simple',
        repeatPassword: 'simple'
      });
      expect(error?.details[0].message).toContain('fails to match the required pattern');
    });

    it('should validate password match', () => {
      const { error } = schemaRegister.validate({
        ...validData,
        repeatPassword: 'DifferentPass123'
      });
      expect(error?.details[0].message).toContain('"repeatPassword" must be [ref:password]');
    });

    it('should validate email format when provided', () => {
      const { error } = schemaRegister.validate({
        ...validData,
        email: 'invalid-email'
      });
      expect(error?.details[0].message).toContain('"email" must be a valid email');
    });

    it('should validate mobile number format when provided', () => {
      const { error } = schemaRegister.validate({
        ...validData,
        mobileNumber: 'invalid'
      });
      expect(error?.details[0].message).toContain('fails to match the required pattern');
    });
  });

  describe('registerWithEmail schema', () => {
    const validData = {
      email: 'test@example.com',
      password: 'Password123',
      repeatPassword: 'Password123',
      firstName: 'Test',
      lastName: 'User'
    };

    it('should validate complete valid data', () => {
      const { error, value } = schemaRegisterWithEmail.validate(validData);
      expect(error).toBeUndefined();
      expect(value.repeatPassword).toBeUndefined();
    });

    it('should require email', () => {
      const { error } = schemaRegisterWithEmail.validate({
        ...validData,
        email: undefined
      });
      expect(error?.details[0].message).toContain('"email" is required');
    });

    it('should validate email format', () => {
      const { error } = schemaRegisterWithEmail.validate({
        ...validData,
        email: 'invalid-email'
      });
      expect(error?.details[0].message).toContain('"email" must be a valid email');
    });
  });

  describe('login schema', () => {
    const validData = {
      username: 'testuser',
      password: 'Password123'
    };

    it('should validate complete valid data', () => {
      const { error } = schemaLogin.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should require username', () => {
      const { error } = schemaLogin.validate({
        ...validData,
        username: undefined
      });
      expect(error?.details[0].message).toContain('"username" is required');
    });

    it('should require password', () => {
      const { error } = schemaLogin.validate({
        ...validData,
        password: undefined
      });
      expect(error?.details[0].message).toContain('"password" is required');
    });
  });

  describe('loginWithEmail schema', () => {
    const validData = {
      email: 'test@example.com',
      password: 'Password123'
    };

    it('should validate complete valid data', () => {
      const { error } = schemaLoginWithEmail.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should require email', () => {
      const { error } = schemaLoginWithEmail.validate({
        ...validData,
        email: undefined
      });
      expect(error?.details[0].message).toContain('"email" is required');
    });

    it('should validate email format', () => {
      const { error } = schemaLoginWithEmail.validate({
        ...validData,
        email: 'invalid-email'
      });
      expect(error?.details[0].message).toContain('"email" must be a valid email');
    });

    it('should require password', () => {
      const { error } = schemaLoginWithEmail.validate({
        ...validData,
        password: undefined
      });
      expect(error?.details[0].message).toContain('"password" is required');
    });
  });
});
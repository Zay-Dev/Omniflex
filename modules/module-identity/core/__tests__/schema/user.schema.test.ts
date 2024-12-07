import { schemas } from '../../user.schema';

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
      const { error, value } = schemas.register.validate(validData);
      expect(error).toBeUndefined();
      expect(value.repeatPassword).toBeUndefined();
    });

    it('should require username', () => {
      const { error } = schemas.register.validate({
        ...validData,
        username: undefined
      });
      expect(error?.details[0].message).toContain('"username" is required');
    });

    it('should validate username format', () => {
      const { error } = schemas.register.validate({
        ...validData,
        username: 'a'
      });
      expect(error?.details[0].message).toContain('"username" length must be at least 3 characters long');
    });

    it('should validate password complexity', () => {
      const { error } = schemas.register.validate({
        ...validData,
        password: 'simple',
        repeatPassword: 'simple'
      });
      expect(error?.details[0].message).toContain('fails to match the required pattern');
    });

    it('should validate password match', () => {
      const { error } = schemas.register.validate({
        ...validData,
        repeatPassword: 'DifferentPass123'
      });
      expect(error?.details[0].message).toContain('"repeatPassword" must be [ref:password]');
    });

    it('should validate email format when provided', () => {
      const { error } = schemas.register.validate({
        ...validData,
        email: 'invalid-email'
      });
      expect(error?.details[0].message).toContain('"email" must be a valid email');
    });

    it('should validate mobile number format when provided', () => {
      const { error } = schemas.register.validate({
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
      const { error, value } = schemas.registerWithEmail.validate(validData);
      expect(error).toBeUndefined();
      expect(value.repeatPassword).toBeUndefined();
    });

    it('should require email', () => {
      const { error } = schemas.registerWithEmail.validate({
        ...validData,
        email: undefined
      });
      expect(error?.details[0].message).toContain('"email" is required');
    });

    it('should validate email format', () => {
      const { error } = schemas.registerWithEmail.validate({
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
      const { error } = schemas.login.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should require username', () => {
      const { error } = schemas.login.validate({
        ...validData,
        username: undefined
      });
      expect(error?.details[0].message).toContain('"username" is required');
    });

    it('should require password', () => {
      const { error } = schemas.login.validate({
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
      const { error } = schemas.loginWithEmail.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should require email', () => {
      const { error } = schemas.loginWithEmail.validate({
        ...validData,
        email: undefined
      });
      expect(error?.details[0].message).toContain('"email" is required');
    });

    it('should validate email format', () => {
      const { error } = schemas.loginWithEmail.validate({
        ...validData,
        email: 'invalid-email'
      });
      expect(error?.details[0].message).toContain('"email" must be a valid email');
    });

    it('should require password', () => {
      const { error } = schemas.loginWithEmail.validate({
        ...validData,
        password: undefined
      });
      expect(error?.details[0].message).toContain('"password" is required');
    });
  });
}); 
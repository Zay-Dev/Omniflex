import { schemaRegister, schemaRegisterWithEmail } from './register.schema';

describe('Register Schemas', () => {
  describe('schemaRegister', () => {
    const validData = {
      username: 'testuser',
      password: 'Password123',
      repeatPassword: 'Password123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      mobileNumber: '+1234567890',
    };

    it('[SCHEMA-V0230] should validate valid register data', () => {
      const { error, value } = schemaRegister.validate(validData);
      expect(error).toBeUndefined();
      expect(value.repeatPassword).toBeUndefined();
      expect(value.username).toBe(validData.username);
    });

    it('[SCHEMA-V0240] should require username and password', () => {
      // Test password requirement
      const { error: passwordError } = schemaRegister.validate({ username: 'testuser' });
      expect(passwordError?.details[0].message).toContain('"password" is required');

      // Test username requirement
      const { error: usernameError } = schemaRegister.validate({ password: 'Password123' });
      expect(usernameError?.details[0].message).toContain('"username" is required');
    });

    it('[SCHEMA-V0250] should validate username length', () => {
      const testCases = [
        { username: 'ab', message: 'length must be at least 3 characters long' },
        { username: 'a'.repeat(31), message: 'length must be less than or equal to 30 characters long' },
      ];

      testCases.forEach(({ username, message }) => {
        const { error } = schemaRegister.validate({
          ...validData,
          username,
        });
        expect(error?.details[0].message).toContain(message);
      });
    });

    it('[SCHEMA-V0260] should make email optional', () => {
      const { error } = schemaRegister.validate({
        ...validData,
        email: undefined,
      });
      expect(error).toBeUndefined();
    });

    it('[SCHEMA-V0270] should validate email format when provided', () => {
      const { error } = schemaRegister.validate({
        ...validData,
        email: 'invalid-email',
      });
      expect(error?.details[0].message).toContain('"email" must be a valid email');
    });
  });

  describe('schemaRegisterWithEmail', () => {
    const validData = {
      email: 'test@example.com',
      password: 'Password123',
      repeatPassword: 'Password123',
      firstName: 'Test',
      lastName: 'User',
    };

    it('[SCHEMA-V0280] should validate valid register with email data', () => {
      const { error, value } = schemaRegisterWithEmail.validate(validData);
      expect(error).toBeUndefined();
      expect(value.repeatPassword).toBeUndefined();
      expect(value.email).toBe(validData.email);
    });

    it('[SCHEMA-V0290] should require email', () => {
      const { error } = schemaRegisterWithEmail.validate({
        password: 'Password123',
        repeatPassword: 'Password123',
      });
      expect(error?.details[0].message).toContain('"email" is required');
    });

    it('[SCHEMA-V0300] should validate email format and convert to lowercase', () => {
      const { error, value } = schemaRegisterWithEmail.validate({
        ...validData,
        email: 'TEST@EXAMPLE.COM',
      });
      expect(error).toBeUndefined();
      expect(value.email).toBe('test@example.com');
    });

    it('[SCHEMA-V0310] should validate matching passwords', () => {
      const { error } = schemaRegisterWithEmail.validate({
        ...validData,
        repeatPassword: 'DifferentPassword123',
      });
      expect(error?.details[0].message).toContain('"repeatPassword" must be [ref:password]');
    });

    it('[SCHEMA-V0320] should strip repeatPassword from output', () => {
      const { error, value } = schemaRegisterWithEmail.validate(validData);
      expect(error).toBeUndefined();
      expect(value.repeatPassword).toBeUndefined();
    });
  });
}); 
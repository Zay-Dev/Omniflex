import {
  schemaLogin,
  schemaLoginWithEmail,
  schemaRegister,
  schemaRegisterWithEmail,
} from '../../joi.schemas';

jest.mock('../../containers', () => ({
  resolve: jest.fn().mockReturnValue({
    users: {},
    profiles: {},
    passwords: {},
    loginAttempts: {},
  }),
}));

describe('Schema Integration', () => {
  describe('Login Flow', () => {
    it('[SCHEMA-I0010] should validate complete login flow', () => {
      // Username login
      const usernameLogin = {
        username: 'testuser',
        password: 'Password123',
      };
      expect(schemaLogin.validate(usernameLogin).error).toBeUndefined();

      // Email login
      const emailLogin = {
        email: 'test@example.com',
        password: 'Password123',
      };
      expect(schemaLoginWithEmail.validate(emailLogin).error).toBeUndefined();
    });

    it('[SCHEMA-I0020] should handle cross-schema validation', () => {
      // Email in username login
      const emailInUsernameLogin = {
        username: 'test@example.com',
        password: 'Password123',
      };
      expect(schemaLogin.validate(emailInUsernameLogin).error).toBeUndefined();

      // Username in email login
      const usernameInEmailLogin = {
        email: 'testuser',
        password: 'Password123',
      };
      expect(schemaLoginWithEmail.validate(usernameInEmailLogin).error).toBeDefined();
    });
  });

  describe('Registration Flow', () => {
    it('[SCHEMA-I0030] should validate complete registration flow', () => {
      // Username registration
      const usernameRegister = {
        username: 'testuser',
        password: 'Password123',
        repeatPassword: 'Password123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };
      expect(schemaRegister.validate(usernameRegister).error).toBeUndefined();

      // Email registration
      const emailRegister = {
        email: 'test@example.com',
        password: 'Password123',
        repeatPassword: 'Password123',
        firstName: 'Test',
        lastName: 'User',
      };
      expect(schemaRegisterWithEmail.validate(emailRegister).error).toBeUndefined();
    });

    it('[SCHEMA-I0040] should handle cross-schema validation', () => {
      // Username registration without email
      const usernameOnly = {
        username: 'testuser',
        password: 'Password123',
        repeatPassword: 'Password123',
      };
      expect(schemaRegister.validate(usernameOnly).error).toBeUndefined();

      // Email registration without username
      const emailOnly = {
        email: 'test@example.com',
        password: 'Password123',
        repeatPassword: 'Password123',
      };
      expect(schemaRegisterWithEmail.validate(emailOnly).error).toBeUndefined();
    });

    it('[SCHEMA-I0050] should validate password requirements', () => {
      const validPassword = 'Password123';
      const invalidPassword = 'weak';

      // Registration schemas should enforce password requirements
      const registerSchemas = [schemaRegister, schemaRegisterWithEmail];
      registerSchemas.forEach(schema => {
        const validData = {
          username: 'testuser',
          email: 'test@example.com',
          password: validPassword,
          repeatPassword: validPassword,
        };
        expect(schema.validate(validData).error).toBeUndefined();

        const invalidData = {
          ...validData,
          password: invalidPassword,
          repeatPassword: invalidPassword,
        };
        expect(schema.validate(invalidData).error).toBeDefined();
      });

      // Login schemas should only check for presence of password
      const loginSchemas = [schemaLogin, schemaLoginWithEmail];
      loginSchemas.forEach(schema => {
        const validData = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'any-password',
        };
        expect(schema.validate(validData).error).toBeUndefined();
      });
    });
  });
});
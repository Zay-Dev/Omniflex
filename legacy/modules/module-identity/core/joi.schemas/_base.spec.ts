import { email, baseRegisterSchema, baseLoginSchema } from './_base';

describe('Base Schemas', () => {
  describe('email schema', () => {
    it('[SCHEMA-V0010] should validate valid email', () => {
      const { error, value } = email.validate('test@example.com');
      expect(error).toBeUndefined();
      expect(value).toBe('test@example.com');
    });

    it('[SCHEMA-V0020] should convert email to lowercase', () => {
      const { error, value } = email.validate('TEST@EXAMPLE.COM');
      expect(error).toBeUndefined();
      expect(value).toBe('test@example.com');
    });

    it('[SCHEMA-V0030] should reject invalid email', () => {
      const { error } = email.validate('invalid-email');
      expect(error).toBeDefined();
    });

    it('[SCHEMA-V0040] should trim whitespace', () => {
      const { error, value } = email.validate(' test@example.com ');
      expect(error).toBeUndefined();
      expect(value).toBe('test@example.com');
    });
  });

  describe('baseRegisterSchema', () => {
    it('[SCHEMA-V0050] should validate valid password', () => {
      const { error } = baseRegisterSchema.password.validate('Password123');
      expect(error).toBeUndefined();
    });

    it('[SCHEMA-V0060] should require lowercase in password', () => {
      const { error } = baseRegisterSchema.password.validate('PASSWORD123');
      expect(error).toBeDefined();
    });

    it('[SCHEMA-V0070] should require uppercase in password', () => {
      const { error } = baseRegisterSchema.password.validate('password123');
      expect(error).toBeDefined();
    });

    it('[SCHEMA-V0080] should require number in password', () => {
      const { error } = baseRegisterSchema.password.validate('Password');
      expect(error).toBeDefined();
    });

    it('[SCHEMA-V0090] should validate valid names', () => {
      const { error: firstNameError } = baseRegisterSchema.firstName.validate('John');
      expect(firstNameError).toBeUndefined();

      const { error: lastNameError } = baseRegisterSchema.lastName.validate('Doe');
      expect(lastNameError).toBeUndefined();
    });

    it('[SCHEMA-V0100] should validate name length', () => {
      const longName = 'a'.repeat(51);
      const { error: firstNameError } = baseRegisterSchema.firstName.validate(longName);
      expect(firstNameError).toBeDefined();

      const { error: lastNameError } = baseRegisterSchema.lastName.validate(longName);
      expect(lastNameError).toBeDefined();
    });

    it('[SCHEMA-V0110] should validate mobile number format', () => {
      const validNumbers = ['+1234567890', '+44123456789', '1234567890'];
      const invalidNumbers = ['abc', '+abc123'];

      // Test valid numbers
      validNumbers.forEach(number => {
        const { error } = baseRegisterSchema.mobileNumber.validate(number);
        expect(error).toBeUndefined();
      });

      // Test invalid numbers
      invalidNumbers.forEach(number => {
        const { error } = baseRegisterSchema.mobileNumber.validate(number);
        expect(error).toBeDefined();
      });

      // Test optional
      const { error } = baseRegisterSchema.mobileNumber.validate(undefined);
      expect(error).toBeUndefined();
    });
  });

  describe('baseLoginSchema', () => {
    it('[SCHEMA-V0120] should validate valid password', () => {
      const { error } = baseLoginSchema.password.validate('Password123');
      expect(error).toBeUndefined();
    });

    it('[SCHEMA-V0130] should require password', () => {
      const { error } = baseLoginSchema.password.validate(undefined);
      expect(error?.details[0].message).toContain('is required');
    });

    it('[SCHEMA-V0140] should trim password', () => {
      const { error, value } = baseLoginSchema.password.validate(' Password123 ');
      expect(error).toBeUndefined();
      expect(value).toBe('Password123');
    });
  });
}); 
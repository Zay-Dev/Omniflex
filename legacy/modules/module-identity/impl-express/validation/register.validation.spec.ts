import { schemaRegister } from '@omniflex/module-identity-core'

describe('Register Validation', () => {
  describe('schemaRegister', () => {
    it('[AUTH-E0040] should validate valid registration data', () => {
      // Arrange
      const validData = {
        username: 'testuser',
        password: 'Password123!',
        email: 'test@example.com'
      }

      // Act
      const result = schemaRegister.validate(validData)

      // Assert
      expect(result.error).toBeFalsy()
      expect(result.value).toEqual(validData)
    })

    it('[AUTH-E0050] should reject empty username', () => {
      // Arrange
      const invalidData = {
        username: '',
        password: 'Password123!',
        email: 'test@example.com'
      }

      // Act
      const result = schemaRegister.validate(invalidData)

      // Assert
      expect(result.error).toBeTruthy()
      expect(result.error?.details[0].path).toEqual(['username'])
    })

    it('[AUTH-E0060] should reject weak password', () => {
      // Arrange
      const invalidData = {
        username: 'testuser',
        password: 'weak',
        email: 'test@example.com'
      }

      // Act
      const result = schemaRegister.validate(invalidData)

      // Assert
      expect(result.error).toBeTruthy()
      expect(result.error?.details[0].path).toEqual(['password'])
    })

    it('[AUTH-E0070] should reject invalid email format', () => {
      // Arrange
      const invalidData = {
        username: 'testuser',
        password: 'Password123!',
        email: 'invalid-email'
      }

      // Act
      const result = schemaRegister.validate(invalidData)

      // Assert
      expect(result.error).toBeTruthy()
      expect(result.error?.details[0].path).toEqual(['email'])
    })

    it('[AUTH-E0080] should allow registration without email', () => {
      // Arrange
      const validData = {
        username: 'testuser',
        password: 'Password123!'
      }

      // Act
      const result = schemaRegister.validate(validData)

      // Assert
      expect(result.error).toBeFalsy()
      expect(result.value).toEqual(validData)
    })
  })
})
import { errors } from '@omniflex/core';
import { throwIfConflictingUsername, throwIfConflictingEmail } from './user.rules';

jest.mock('@omniflex/core', () => ({
  errors: {
    conflict: jest.fn().mockReturnValue(new Error('Conflict')),
  },
}));

jest.mock('./containers', () => ({
  resolve: jest.fn().mockReturnValue({
    users: {
      exists: jest.fn(),
    },
    passwords: {
      exists: jest.fn(),
    },
  }),
}));

describe('User Rules Unit Tests', () => {
  const { users, passwords } = jest.requireMock('./containers').resolve();

  beforeEach(() => {
    jest.clearAllMocks();
    users.exists.mockResolvedValue(false);
    passwords.exists.mockResolvedValue(false);
  });

  describe('throwIfConflictingUsername', () => {
    it('[RULE-V0010] should validate username availability', async () => {
      await expect(throwIfConflictingUsername({ username: 'test-user' }))
        .resolves.not.toThrow();
    });

    it('[RULE-V0020] should throw if username exists as identifier', async () => {
      users.exists.mockResolvedValue(true);

      await expect(throwIfConflictingUsername({ username: 'test-user' }))
        .rejects.toThrow('Conflict');
    });

    it('[RULE-V0030] should throw if username exists in passwords', async () => {
      passwords.exists.mockResolvedValue(true);

      await expect(throwIfConflictingUsername({ username: 'test-user' }))
        .rejects.toThrow('Conflict');
    });
  });

  describe('throwIfConflictingEmail', () => {
    it('[RULE-V0040] should validate email availability', async () => {
      await expect(throwIfConflictingEmail({ email: 'test@example.com' }))
        .resolves.not.toThrow();
    });

    it('[RULE-V0050] should throw if email exists as identifier', async () => {
      users.exists.mockResolvedValue(true);

      await expect(throwIfConflictingEmail({ email: 'test@example.com' }))
        .rejects.toThrow('Conflict');
    });
  });
}); 
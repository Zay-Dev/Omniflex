import { errors } from '@omniflex/core';
import { throwIfConflictingUsername, throwIfConflictingEmail } from '../../user.rules';

jest.mock('@omniflex/core', () => ({
  errors: {
    conflict: jest.fn().mockReturnValue(new Error('Conflict')),
  },
}));

jest.mock('../../containers', () => ({
  resolve: jest.fn().mockReturnValue({
    users: {
      exists: jest.fn(),
    },
    passwords: {
      exists: jest.fn(),
    },
  }),
}));

describe('User Rules Integration', () => {
  const { users, passwords } = jest.requireMock('../../containers').resolve();

  beforeEach(() => {
    jest.clearAllMocks();
    users.exists.mockResolvedValue(false);
    passwords.exists.mockResolvedValue(false);
  });

  describe('Repository Integration', () => {
    it('[RULE-I0010] should check both repositories for username conflicts', async () => {
      const username = 'test-user';
      await throwIfConflictingUsername({ username });

      expect(users.exists).toHaveBeenCalledWith({
        deletedAt: null,
        identifier: username,
      });
      expect(passwords.exists).toHaveBeenCalledWith({
        username,
        deletedAt: null,
      });
    });

    it('[RULE-I0020] should check both repositories for email conflicts', async () => {
      const email = 'test@example.com';
      await throwIfConflictingEmail({ email });

      expect(users.exists).toHaveBeenCalledWith({
        deletedAt: null,
        identifier: email,
      });
      expect(passwords.exists).toHaveBeenCalledWith({
        username: email,
        deletedAt: null,
      });
    });

    it('[RULE-I0030] should handle repository errors', async () => {
      const error = new Error('Database error');
      users.exists.mockRejectedValueOnce(error);

      await expect(throwIfConflictingUsername({ username: 'test-user' }))
        .rejects.toThrow(error);
    });
  });
});
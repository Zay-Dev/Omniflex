import { errors } from '@omniflex/core';

import { throwIfConflictingUsername, throwIfConflictingEmail } from '../../user.rules';

jest.mock('@omniflex/core', () => ({
  errors: {
    conflict: jest.fn().mockReturnValue(new Error('Conflict'))
  }
}));

jest.mock('../../containers', () => ({
  resolve: jest.fn().mockReturnValue({
    users: {
      isValidPrimaryKey: jest.fn(),
      exists: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn()
    },
    passwords: {
      isValidPrimaryKey: jest.fn(),
      exists: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
      findByUsername: jest.fn()
    }
  })
}));

describe('User Rules', () => {
  const { users, passwords } = jest.requireMock('../../containers').resolve();

  beforeEach(() => {
    jest.clearAllMocks();
    users.exists.mockResolvedValue(false);
    passwords.exists.mockResolvedValue(false);
  });

  describe('throwIfConflictingUsername', () => {
    const username = 'test-username';

    it('should not throw if username is available', async () => {
      await expect(throwIfConflictingUsername({ username }))
        .resolves.not.toThrow();

      expect(users.exists).toHaveBeenCalledWith({
        deletedAt: null,
        identifier: username
      });

      expect(passwords.exists).toHaveBeenCalledWith({
        username,
        deletedAt: null
      });
    });

    it('should throw if user exists with username as identifier', async () => {
      users.exists.mockResolvedValue(true);

      await expect(throwIfConflictingUsername({ username }))
        .rejects.toThrow('Conflict');
    });

    it('should throw if password exists with username', async () => {
      passwords.exists.mockResolvedValue(true);

      await expect(throwIfConflictingUsername({ username }))
        .rejects.toThrow('Conflict');
    });
  });

  describe('throwIfConflictingEmail', () => {
    const email = 'test@example.com';

    it('should reuse username validation logic', async () => {
      await throwIfConflictingEmail({ email });

      expect(users.exists).toHaveBeenCalledWith({
        deletedAt: null,
        identifier: email
      });

      expect(passwords.exists).toHaveBeenCalledWith({
        username: email,
        deletedAt: null
      });
    });

    it('should throw if email is already used', async () => {
      users.exists.mockResolvedValue(true);

      await expect(throwIfConflictingEmail({ email }))
        .rejects.toThrow('Conflict');
    });
  });
});
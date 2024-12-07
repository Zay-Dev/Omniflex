import { providers } from '@omniflex/core';

import { PasswordAuthService } from '../../password-auth.service';
import { mockUser, mockUserPassword } from '../utils/mocks';

jest.mock('@omniflex/core', () => ({
  errors: {
    unauthorized: jest.fn().mockReturnValue(new Error('Unauthorized'))
  },
  providers: {
    hash: {
      hash: jest.fn(),
      verify: jest.fn()
    }
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
    profiles: {
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
    },
    loginAttempts: {
      create: jest.fn()
    }
  })
}));

describe('PasswordAuthService', () => {
  const service = new PasswordAuthService('test-app');
  const mockHashProvider = providers.hash as jest.Mocked<typeof providers.hash>;
  const { users, profiles, passwords, loginAttempts } = jest.requireMock('../../containers').resolve();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerWithUsername', () => {
    const registerInfo = {
      username: 'test-username',
      password: 'test-password'
    };

    const profileInfo = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      mobileNumber: '1234567890',
      customField: 'custom-value'
    };

    beforeEach(() => {
      users.create.mockResolvedValue(mockUser);
      mockHashProvider.hash.mockResolvedValue('hashed-password');
    });

    it('should create user with username as identifier', async () => {
      await service.registerWithUsername(registerInfo, profileInfo);

      expect(users.create).toHaveBeenCalledWith({
        identifier: registerInfo.username
      });
    });

    it('should create password with hashed value', async () => {
      await service.registerWithUsername(registerInfo, profileInfo);

      expect(passwords.create).toHaveBeenCalledWith(expect.objectContaining({
        username: registerInfo.username,
        hashedPassword: 'hashed-password',
        userId: mockUser.id
      }));
    });

    it('should create profile with provided info', async () => {
      await service.registerWithUsername(registerInfo, profileInfo);

      expect(profiles.create).toHaveBeenCalledWith({
        email: profileInfo.email,
        firstName: profileInfo.firstName,
        lastName: profileInfo.lastName,
        mobileNumber: profileInfo.mobileNumber,
        profile: { customField: profileInfo.customField },
        userId: mockUser.id
      });
    });

    it('should return created user', async () => {
      const result = await service.registerWithUsername(registerInfo, profileInfo);
      expect(result).toBe(mockUser);
    });
  });

  describe('loginByUsername', () => {
    const loginInfo = {
      username: 'test-username',
      password: 'test-password',
      remoteAddress: '127.0.0.1'
    };

    beforeEach(() => {
      passwords.findByUsername.mockResolvedValue(mockUserPassword);
      mockHashProvider.verify.mockResolvedValue(true);
      users.findOne.mockResolvedValue(mockUser);
    });

    it('should throw if user password not found', async () => {
      passwords.findByUsername.mockResolvedValue(null);

      await expect(service.loginByUsername(loginInfo))
        .rejects.toThrow('Unauthorized');

      expect(loginAttempts.create).toHaveBeenCalledWith(expect.objectContaining({
        loginType: 'PASSWORD',
        appType: 'test-app',
        success: false,
        identifier: loginInfo.username,
        remoteAddress: loginInfo.remoteAddress
      }));
    });

    it('should throw if password verification fails', async () => {
      mockHashProvider.verify.mockResolvedValue(false);

      await expect(service.loginByUsername(loginInfo))
        .rejects.toThrow('Unauthorized');

      expect(loginAttempts.create).toHaveBeenCalledWith(expect.objectContaining({
        loginType: 'PASSWORD',
        appType: 'test-app',
        success: false,
        userId: mockUserPassword.userId,
        identifier: loginInfo.username,
        remoteAddress: loginInfo.remoteAddress
      }));
    });

    it('should throw if user not found', async () => {
      users.findOne.mockResolvedValue(null);

      await expect(service.loginByUsername(loginInfo))
        .rejects.toThrow('Unauthorized');

      expect(loginAttempts.create).toHaveBeenCalledWith(expect.objectContaining({
        loginType: 'PASSWORD',
        appType: 'test-app',
        success: false,
        userId: mockUserPassword.userId,
        identifier: loginInfo.username,
        remoteAddress: loginInfo.remoteAddress
      }));
    });

    it('should update last sign in time and return user on success', async () => {
      const result = await service.loginByUsername(loginInfo);

      expect(users.updateById).toHaveBeenCalledWith(mockUser.id, {
        lastSignInAtUtc: expect.any(Date)
      });

      expect(loginAttempts.create).toHaveBeenCalledWith(expect.objectContaining({
        loginType: 'PASSWORD',
        appType: 'test-app',
        success: true,
        userId: mockUser.id,
        identifier: loginInfo.username,
        remoteAddress: loginInfo.remoteAddress
      }));

      expect(result).toBe(mockUser);
    });
  });
}); 
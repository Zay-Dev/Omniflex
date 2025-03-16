import { errors, providers } from '@omniflex/core';
import { container } from '../../containers';
import { PasswordAuthService } from '../../services/password-auth.service';
import { createTestUser, createTestUserPassword, createTestLoginAttempt, createTestUserProfile } from '../../test-utils/factories';
import { IUserRepository, IUserPasswordRepository, ILoginAttemptRepository, IUserProfileRepository } from '../../types';

jest.mock('@omniflex/core', () => ({
  errors: {
    unauthorized: jest.fn().mockReturnValue(new Error('Unauthorized')),
    conflict: jest.fn().mockReturnValue(new Error('Conflict')),
  },
  providers: {
    hash: {
      hash: jest.fn().mockResolvedValue('hashed-password'),
      verify: jest.fn().mockResolvedValue(true),
    },
  },
}));

describe('PasswordAuthService Integration', () => {
  let service: PasswordAuthService;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockPasswordRepo: jest.Mocked<IUserPasswordRepository>;
  let mockLoginAttemptRepo: jest.Mocked<ILoginAttemptRepository>;
  let mockProfileRepo: jest.Mocked<IUserProfileRepository>;

  beforeEach(() => {
    mockUserRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      updateById: jest.fn(),
    } as any;

    mockPasswordRepo = {
      create: jest.fn(),
      findByUsername: jest.fn(),
    } as any;

    mockLoginAttemptRepo = {
      create: jest.fn(),
    } as any;

    mockProfileRepo = {
      create: jest.fn(),
    } as any;

    container.register({
      userRepository: { resolve: () => mockUserRepo },
      userProfileRepository: { resolve: () => mockProfileRepo },
      userPasswordRepository: { resolve: () => mockPasswordRepo },
      loginAttemptRepository: { resolve: () => mockLoginAttemptRepo },
    });

    service = new PasswordAuthService('test-app');
  });

  describe('User Registration Flow', () => {
    it('[AUTH-I0010] should register and login with new user', async () => {
      const username = 'test-user';
      const password = 'test-password';
      const profile = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const user = createTestUser();
      const userPassword = createTestUserPassword({ userId: user.id });
      const userProfile = createTestUserProfile({ userId: user.id });

      // Registration
      mockUserRepo.create.mockResolvedValueOnce(user);
      mockPasswordRepo.create.mockResolvedValueOnce(userPassword);
      mockProfileRepo.create.mockResolvedValueOnce(userProfile);

      const registeredUser = await service.registerWithUsername(
        { username, password },
        profile,
      );

      expect(registeredUser).toBeTruthy();

      // Login
      mockPasswordRepo.findByUsername.mockResolvedValueOnce(userPassword);
      mockUserRepo.findOne.mockResolvedValueOnce(user);
      mockLoginAttemptRepo.create.mockResolvedValueOnce(createTestLoginAttempt({
        userId: user.id,
        success: true,
      }));

      const loggedInUser = await service.loginByUsername({
        username,
        password,
      });

      expect(loggedInUser).toBeTruthy();
      expect(mockUserRepo.updateById).toHaveBeenCalledWith(user.id, {
        lastSignInAtUtc: expect.any(Date),
      });
    });

    it('[AUTH-I0020] should handle registration and login failures', async () => {
      const username = 'test-user';
      const password = 'test-password';

      // Registration failure - user creation fails
      mockUserRepo.create.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.registerWithUsername(
        { username, password },
        {},
      )).rejects.toThrow();

      // Login failure - wrong password
      const userPassword = createTestUserPassword();
      (providers.hash.verify as jest.Mock).mockResolvedValueOnce(false);

      mockPasswordRepo.findByUsername.mockResolvedValueOnce(userPassword);

      await expect(service.loginByUsername({
        username,
        password: 'wrong-password',
      })).rejects.toThrow('Unauthorized');

      expect(mockLoginAttemptRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        userId: userPassword.userId,
      }));
    });
  });

  describe('Login Attempt Recording', () => {
    it('[AUTH-I0030] should record all login attempts with correct data', async () => {
      const username = 'test-user';
      const password = 'test-password';
      const remoteAddress = '127.0.0.1';

      // Failed login - user not found
      await expect(service.loginByUsername({
        username,
        password,
        remoteAddress,
      })).rejects.toThrow('Unauthorized');

      expect(mockLoginAttemptRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        identifier: username,
        success: false,
        remoteAddress,
        loginType: 'PASSWORD',
        appType: 'test-app',
      }));

      // Successful login
      const user = createTestUser();
      const userPassword = createTestUserPassword({ userId: user.id });

      mockPasswordRepo.findByUsername.mockResolvedValueOnce(userPassword);
      mockUserRepo.findOne.mockResolvedValueOnce(user);

      await service.loginByUsername({
        username,
        password,
        remoteAddress,
      });

      expect(mockLoginAttemptRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        identifier: username,
        success: true,
        userId: user.id,
        remoteAddress,
        loginType: 'PASSWORD',
        appType: 'test-app',
      }));
    });
  });
});
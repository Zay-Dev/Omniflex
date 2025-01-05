import { errors, providers } from '@omniflex/core';
import * as containers from '../containers';
import { PasswordAuthService } from './password-auth.service';
import { createTestUser, createTestUserPassword, createTestLoginAttempt, createTestUserProfile } from '../test-utils/factories';
import { IUserRepository, IUserPasswordRepository, ILoginAttemptRepository, IUserProfileRepository } from '../types';

jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

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

describe('PasswordAuthService', () => {
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

    jest.spyOn(containers, 'resolve').mockReturnValue({
      users: mockUserRepo,
      profiles: mockProfileRepo,
      passwords: mockPasswordRepo,
      loginAttempts: mockLoginAttemptRepo,
    });

    service = new PasswordAuthService('test-app');
  });

  describe('registerWithUsername', () => {
    it('[AUTH-C0010] should register a new user with username and password', async () => {
      const username = 'test-user';
      const password = 'test-password';
      const profile = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      mockUserRepo.create.mockResolvedValueOnce(createTestUser());
      mockPasswordRepo.create.mockResolvedValueOnce(createTestUserPassword());
      mockProfileRepo.create.mockResolvedValueOnce(createTestUserProfile());

      const result = await service.registerWithUsername(
        { username, password },
        profile,
      );

      expect(result).toBeTruthy();
      expect(mockUserRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        identifier: username,
      }));
      expect(mockPasswordRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        username,
        hashedPassword: expect.any(String),
        salt: expect.any(String),
      }));
      expect(mockProfileRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
      }));
    });
  });

  describe('loginByUsername', () => {
    it('[AUTH-R0010] should login successfully with correct credentials', async () => {
      const username = 'test-user';
      const password = 'test-password';
      const userPassword = createTestUserPassword();
      const user = createTestUser();

      mockPasswordRepo.findByUsername.mockResolvedValueOnce(userPassword);
      mockUserRepo.findOne.mockResolvedValueOnce(user);
      mockLoginAttemptRepo.create.mockResolvedValueOnce(createTestLoginAttempt());

      const result = await service.loginByUsername({
        username,
        password,
      });

      expect(result).toBeTruthy();
      expect(mockLoginAttemptRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        identifier: username,
        success: true,
      }));
    });

    it('[AUTH-E0020] should throw if user not found', async () => {
      mockPasswordRepo.findByUsername.mockResolvedValueOnce(null);

      await expect(service.loginByUsername({
        username: 'test-user',
        password: 'test-password',
      })).rejects.toThrow('Unauthorized');

      expect(mockLoginAttemptRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
      }));
    });

    it('[AUTH-E0030] should throw if password is incorrect', async () => {
      const userPassword = createTestUserPassword();
      (providers.hash.verify as jest.Mock).mockResolvedValueOnce(false);

      mockPasswordRepo.findByUsername.mockResolvedValueOnce(userPassword);

      await expect(service.loginByUsername({
        username: 'test-user',
        password: 'wrong-password',
      })).rejects.toThrow('Unauthorized');

      expect(mockLoginAttemptRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
      }));
    });
  });
}); 
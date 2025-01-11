import { v4 as uuid } from 'uuid';
import { TUser, TUserPassword, TUserProfile, TLoginAttempt } from '../types';

export const createTestUser = (overrides: Partial<TUser> = {}): TUser => ({
  id: uuid(),
  identifier: 'test-user',
  isVerified: false,
  lastSignInAtUtc: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

export const createTestUserPassword = (overrides: Partial<TUserPassword> = {}): TUserPassword => ({
  id: uuid(),
  username: 'test-user',
  hashedPassword: 'hashed-password',
  salt: 'test-salt',
  userId: uuid(),
  user: createTestUser(),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

export const createTestUserProfile = (overrides: Partial<TUserProfile> = {}): TUserProfile => ({
  id: uuid(),
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  mobileNumber: '+1234567890',
  userId: uuid(),
  user: createTestUser(),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

export const createTestLoginAttempt = (overrides: Partial<TLoginAttempt> = {}): TLoginAttempt => ({
  id: uuid(),
  identifier: 'test-user',
  loginType: 'password',
  appType: 'test-app',
  success: true,
  remoteAddress: '127.0.0.1',
  remark: null,
  userId: uuid(),
  user: createTestUser(),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
}); 
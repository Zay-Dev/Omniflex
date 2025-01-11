import { v4 as uuidv4 } from 'uuid';
import { TLoginAttempt, TUserPassword, TUserProfile, TUser } from '@omniflex/module-identity-core/types';

export const createTestUser = (overrides: Partial<TUser> = {}): TUser => ({
  id: uuidv4(),
  identifier: `test-user-${uuidv4()}`,
  isVerified: false,
  lastSignInAtUtc: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

export const createTestLoginAttempt = (overrides: Partial<TLoginAttempt> = {}): TLoginAttempt => {
  const user = overrides.user || (overrides.userId ? createTestUser({ id: overrides.userId }) : undefined);

  const userId = overrides.userId || user?.id;

  return {
    id: uuidv4(),
    identifier: 'test@example.com',
    loginType: 'password',
    appType: 'web',
    success: true,
    remoteAddress: '127.0.0.1',
    remark: { device: 'test' },
    userId,
    user,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
};

export const createTestUserPassword = (overrides: Partial<TUserPassword> = {}): TUserPassword => {
  const user = overrides.user || (overrides.userId ? createTestUser({ id: overrides.userId }) : createTestUser());

  return {
    id: uuidv4(),
    salt: 'test-salt',
    username: `test-user-${uuidv4()}`,
    hashedPassword: 'hashed-password',
    userId: user.id,
    user,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
};

export const createTestUserProfile = (overrides: Partial<TUserProfile> = {}): TUserProfile => {
  const user = overrides.user || (overrides.userId ? createTestUser({ id: overrides.userId }) : createTestUser());
  
  return {
    id: uuidv4(),
    profileImage: 'test-image.jpg',
    email: `test-${uuidv4()}@example.com`,
    mobileNumber: '+1234567890',
    firstName: 'Test',
    lastName: 'User',
    profile: { bio: 'test bio' },
    userId: user.id,
    user,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}; 
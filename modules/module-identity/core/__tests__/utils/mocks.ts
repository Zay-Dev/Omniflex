import { TUser, TUserPassword } from '../../types';

export const mockUser: TUser = {
  id: 'test-user-id',
  identifier: 'test-identifier',
  isVerified: false,
  lastSignInAtUtc: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
};

export const mockUserPassword: TUserPassword = {
  id: 'test-password-id',
  userId: mockUser.id,
  user: mockUser,
  username: 'test-username',
  salt: 'test-salt',
  hashedPassword: 'test-hashed-password',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
}; 
import { TUserSession } from '@omniflex/module-user-session-core/types';
import { v4 as uuid } from 'uuid';

interface ITestUser {
  id: string;
  [key: string]: any;
  [key: symbol]: any;
}

export const createTestUser = (overrides: Partial<ITestUser> = {}): ITestUser => ({
  id: uuid(),
  ...overrides,
});

export const createTestUserSession = (overrides: Partial<TUserSession> = {}): TUserSession => ({
  id: 'test-id',
  userId: 'test-user-id',
  sessionType: 'access',
  expiredAt: new Date(Date.now() + 3600000), // 1 hour from now
  isActive: true,
  identifier: 'test-identifier',
  pairIdentifier: 'test-pair-identifier',
  metadata: {},
  deviceInfo: {},
  userAgent: 'test-user-agent',
  remoteAddress: '127.0.0.1',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});
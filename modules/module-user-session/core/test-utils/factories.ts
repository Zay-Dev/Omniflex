import { v4 as uuid } from 'uuid';
import { TUserSession } from '../types';

export const createTestUserSession = (overrides: Partial<TUserSession> = {}): TUserSession => ({
  id: uuid(),
  userId: uuid(),
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
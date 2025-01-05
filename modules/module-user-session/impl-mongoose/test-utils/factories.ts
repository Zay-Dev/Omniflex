import { createMockObjectId } from '@omniflex/infra-mongoose/test-utils/mongoose.mock';
import { TUserSession } from '@omniflex/module-user-session-core/types';

export const createTestUserSession = (overrides: Partial<TUserSession> = {}): TUserSession => ({
  id: createMockObjectId(),
  userId: createMockObjectId(),
  sessionType: 'refresh',
  expiredAt: new Date(),
  isActive: true,
  identifier: 'test-identifier',
  pairIdentifier: 'test-pair-identifier',
  metadata: {},
  deviceInfo: {},
  userAgent: 'test-agent',
  remoteAddress: '127.0.0.1',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});
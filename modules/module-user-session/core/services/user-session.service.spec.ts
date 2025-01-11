import { errors } from '@omniflex/core';
import * as containers from '../containers';
import { UserSessionService } from './user-session.service';
import { createTestUserSession } from '../test-utils/factories';
import { IUserSessionRepository } from '../types';

jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

describe('UserSessionService', () => {
  let mockRepository: jest.Mocked<IUserSessionRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      update: jest.fn(),
      exists: jest.fn(),
    } as any;

    jest.spyOn(containers, 'resolve').mockReturnValue({
      sessions: mockRepository,
    });
  });

  describe('getCreateSession', () => {
    it('should create a session with the correct data', async () => {
      const userId = 'test-user-id';
      const metadata = { key: 'value' };
      const userAgent = 'test-user-agent';
      const deviceInfo = { device: 'test' };
      const remoteAddress = '127.0.0.1';

      const createSession = UserSessionService.getCreateSession(userId, {
        metadata,
        userAgent,
        deviceInfo,
        remoteAddress,
      });

      const sessionType = 'access';
      const expiresInMs = 3600000;

      mockRepository.create.mockResolvedValueOnce({
        ...createTestUserSession({
          userId,
          identifier: 'test-uuid',
          pairIdentifier: 'test-uuid',
        }),
      });

      const result = await createSession(sessionType, expiresInMs);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        pairIdentifier: 'test-uuid',
        metadata,
        userAgent,
        deviceInfo,
        remoteAddress,
        isActive: true,
        expiredAt: expect.any(Date),
        identifier: 'test-uuid',
        sessionType,
      });

      expect(result).toEqual(expect.objectContaining({
        userId,
        pairIdentifier: 'test-uuid',
        identifier: 'test-uuid',
        sessionType,
      }));
    });
  });

  describe('inactivateByPairIdentifier', () => {
    it('should inactivate all sessions with the given pair identifier', async () => {
      const pairIdentifier = 'test-pair-id';

      mockRepository.update.mockResolvedValueOnce(2);

      await UserSessionService.inactivateByPairIdentifier(pairIdentifier);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { pairIdentifier },
        { isActive: false },
      );
    });
  });

  describe('throwIfInvalidSession', () => {
    it('should not throw if session is valid', async () => {
      const identifier = 'test-identifier';

      mockRepository.exists.mockResolvedValueOnce(true);

      await expect(UserSessionService.throwIfInvalidSession(identifier))
        .resolves.not.toThrow();

      expect(mockRepository.exists).toHaveBeenCalledWith({
        identifier,
        isActive: true,
        deletedAt: null,
        expiredAt: { $gt: expect.any(Date) },
      });
    });

    it('should throw if identifier is not provided', async () => {
      await expect(UserSessionService.throwIfInvalidSession(''))
        .rejects.toThrow(errors.unauthorized());
    });

    it('should throw if session is not found', async () => {
      const identifier = 'test-identifier';

      mockRepository.exists.mockResolvedValueOnce(false);

      await expect(UserSessionService.throwIfInvalidSession(identifier))
        .rejects.toThrow(errors.unauthorized());
    });
  });
});
import { errors } from '@omniflex/core';
import { UserSessionService } from '../services/user-session.service';
import { IUserSessionRepository } from '../types';
import { resolve } from '../containers';

jest.mock('../containers');

const mockSessions: jest.Mocked<IUserSessionRepository> = {
  create: jest.fn(),
  exists: jest.fn(),
  updateMany: jest.fn(),
  deactivateByUserId: jest.fn(),
  deactivateBySessionType: jest.fn(),
} as any;

const mockResolve = resolve as jest.MockedFunction<typeof resolve>;
mockResolve.mockReturnValue({ sessions: mockSessions });

describe('UserSessionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCreateSession', () => {
    const userId = 'test-user-id';
    const sessionData = {
      metadata: { key: 'value' },
      userAgent: 'test-agent',
      deviceInfo: { device: 'test' },
      remoteAddress: '127.0.0.1',
    };

    it('should create a session with correct data', async () => {
      const createSession = UserSessionService.getCreateSession(userId, sessionData);
      const sessionType = 'test-type';
      const expiresInMs = 3600000;

      mockSessions.create.mockResolvedValueOnce({ id: 'test-id' } as any);

      const result = await createSession(sessionType, expiresInMs);

      expect(mockSessions.create).toHaveBeenCalledWith(expect.objectContaining({
        userId,
        sessionType,
        isActive: true,
        metadata: sessionData.metadata,
        userAgent: sessionData.userAgent,
        deviceInfo: sessionData.deviceInfo,
        remoteAddress: sessionData.remoteAddress,
      }));

      expect(result).toEqual({ id: 'test-id' });
    });

    it('should set correct expiry time', async () => {
      const createSession = UserSessionService.getCreateSession(userId, sessionData);
      const expiresInMs = 3600000;
      const now = new Date();
      jest.useFakeTimers().setSystemTime(now);

      await createSession('test-type', expiresInMs);

      expect(mockSessions.create).toHaveBeenCalledWith(expect.objectContaining({
        expiredAt: new Date(now.getTime() + expiresInMs),
      }));

      jest.useRealTimers();
    });
  });

  describe('inactivateByPairIdentifier', () => {
    it('should update sessions with matching pair identifier', async () => {
      const pairIdentifier = 'test-pair-id';

      await UserSessionService.inactivateByPairIdentifier(pairIdentifier);

      expect(mockSessions.updateMany).toHaveBeenCalledWith(
        { pairIdentifier },
        { isActive: false }
      );
    });
  });

  describe('throwIfInvalidSession', () => {
    it('should throw if identifier is empty', async () => {
      await expect(UserSessionService.throwIfInvalidSession('')).rejects.toThrow(errors.unauthorized());
    });

    it('should throw if session does not exist', async () => {
      mockSessions.exists.mockResolvedValueOnce(false);

      await expect(UserSessionService.throwIfInvalidSession('test-id')).rejects.toThrow(errors.unauthorized());
    });

    it('should not throw for valid session', async () => {
      mockSessions.exists.mockResolvedValueOnce({ id: 'test-id' } as any);

      await expect(UserSessionService.throwIfInvalidSession('test-id')).resolves.not.toThrow();
    });

    it('should check session with correct criteria', async () => {
      const identifier = 'test-id';
      mockSessions.exists.mockResolvedValueOnce({ id: identifier } as any);

      await UserSessionService.throwIfInvalidSession(identifier);

      expect(mockSessions.exists).toHaveBeenCalledWith({
        identifier,
        isActive: true,
        deletedAt: null,
        expiredAt: expect.any(Object),
      });
    });
  });
});
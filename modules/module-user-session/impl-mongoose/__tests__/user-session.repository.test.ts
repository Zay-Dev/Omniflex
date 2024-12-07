import { Model } from 'mongoose';
import { UserSessionRepository } from '../repositories/user-session.repository';

describe('UserSessionRepository (Mongoose)', () => {
  const mockModel = {
    updateMany: jest.fn(),
    schema: {
      alias: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      methods: {},
      statics: {},
      tree: {},
      paths: {},
      options: {
        noAliasId: false
      }
    },
    model: {
      schema: {
        recompileSchema: jest.fn(),
      },
    },
    recompileSchema: jest.fn(),
    base: {
      models: {},
    },
    db: {
      models: {},
    },
    collection: {
      name: 'user_sessions',
    },
    modelName: 'UserSession',
  } as unknown as Model<any>;

  const repository = new UserSessionRepository(mockModel);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deactivateByUserId', () => {
    it('should deactivate all active sessions for user', async () => {
      const userId = 'test-user-id';

      await repository.deactivateByUserId(userId);

      expect(mockModel.updateMany).toHaveBeenCalledWith(
        { userId, isActive: true, deletedAt: null },
        { isActive: false }
      );
    });
  });

  describe('deactivateBySessionType', () => {
    it('should deactivate all active sessions of specific type for user', async () => {
      const userId = 'test-user-id';
      const sessionType = 'refresh';

      await repository.deactivateBySessionType(userId, sessionType);

      expect(mockModel.updateMany).toHaveBeenCalledWith(
        {
          userId,
          sessionType,
          isActive: true,
          deletedAt: null
        },
        { isActive: false }
      );
    });
  });
});
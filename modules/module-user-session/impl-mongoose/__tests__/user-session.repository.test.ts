import { UserSessionRepository } from '../repositories/user-sessions';
import { createMockMongooseModel } from '@omniflex/infra-mongoose/__tests__/utils/mongoose.mock';

describe('UserSessionRepository (Mongoose)', () => {
  const mockModel = createMockMongooseModel({
    collection: { name: 'user_sessions' },
    modelName: 'UserSession',
  });

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
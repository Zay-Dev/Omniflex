import { Model } from 'sequelize';
import { TModel } from '@omniflex/infra-sequelize-v6';
import { TUserSession } from '@omniflex/module-user-session-core/types';
import { UserSessionRepository } from '../repositories/user-session.repository';

describe('UserSessionRepository (Sequelize)', () => {
  const mockModel = {
    update: jest.fn(),
    tableName: 'user_sessions',
    primaryKeyAttribute: 'id',
    primaryKeyAttributes: ['id'],
  } as unknown as TModel<Model<TUserSession>>;

  const repository = new UserSessionRepository(mockModel);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deactivateByUserId', () => {
    it('should deactivate all active sessions for user', async () => {
      const userId = 'test-user-id';

      await repository.deactivateByUserId(userId);

      expect(mockModel.update).toHaveBeenCalledWith(
        { isActive: false },
        { where: { userId, isActive: true } }
      );
    });
  });

  describe('deactivateBySessionType', () => {
    it('should deactivate all active sessions of specific type for user', async () => {
      const userId = 'test-user-id';
      const sessionType = 'refresh';

      await repository.deactivateBySessionType(userId, sessionType);

      expect(mockModel.update).toHaveBeenCalledWith(
        { isActive: false },
        {
          where: {
            userId,
            sessionType,
            isActive: true
          }
        }
      );
    });
  });
});
import { Model } from 'sequelize';
import { TModel, PostgresRepository } from '@omniflex/infra-postgres';
import { IUserSessionRepository, TUserSession } from '@omniflex/module-user-session-core/types';

export class UserSessionRepository
  extends PostgresRepository<TUserSession>
  implements IUserSessionRepository {
  constructor(model: TModel<Model<TUserSession>>) {
    super(model);
  }

  async deactivateByUserId(userId: string) {
    await this.model.update(
      { isActive: false },
      { where: { userId, isActive: true, isDeleted: false } }
    );
  }

  async deactivateBySessionType(userId: string, sessionType: string) {
    await this.model.update(
      { isActive: false },
      {
        where: {
          userId,
          sessionType,
          isActive: true,
          isDeleted: false
        }
      }
    );
  }
}
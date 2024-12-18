import { Model } from 'sequelize';
import { TModel, SequelizeRepository } from '@omniflex/infra-sequelize-v6';
import { IUserSessionRepository, TUserSession } from '@omniflex/module-user-session-core/types';

export class UserSessionRepository
  extends SequelizeRepository<TUserSession>
  implements IUserSessionRepository {
  constructor(model: TModel<Model<TUserSession>>) {
    super(model);
  }

  async deactivateByUserId(userId: string) {
    await this.model.update(
      { isActive: false },
      { where: { userId, isActive: true } }
    );
  }

  async deactivateBySessionType(userId: string, sessionType: string) {
    await this.model.update(
      { isActive: false },
      {
        where: {
          userId,
          sessionType,
          isActive: true
        }
      }
    );
  }
}
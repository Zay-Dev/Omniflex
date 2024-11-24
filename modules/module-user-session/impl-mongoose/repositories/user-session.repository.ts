import { Model } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserSessionRepository, TUserSession } from '@omniflex/module-user-session-core/types';

export class UserSessionRepository
  extends MongooseBaseRepository<TUserSession>
  implements IUserSessionRepository {
  constructor(model: Model<TUserSession>) {
    super(model);
  }

  async deactivateByUserId(userId: string) {
    await this.model.updateMany(
      { userId, isActive: true, isDeleted: false },
      { isActive: false }
    );
  }

  async deactivateBySessionType(userId: string, sessionType: string) {
    await this.model.updateMany(
      {
        userId,
        sessionType,
        isActive: true,
        isDeleted: false
      },
      { isActive: false }
    );
  }
}
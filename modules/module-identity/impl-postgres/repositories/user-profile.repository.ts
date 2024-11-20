import { Model } from 'sequelize';
import { TModel, PostgresRepository } from '@omniflex/infra-postgres';
import { IUserProfileRepository, TUser, TUserProfile } from '@omniflex/module-identity-core/types';

export class UserProfileRepository
  extends PostgresRepository<TUserProfile>
  implements IUserProfileRepository {
  constructor(model: TModel<Model<TUserProfile>>) {
    super(model);
  }
}
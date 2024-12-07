import { Model } from 'sequelize';
import { TModel, SequelizeRepository } from '@omniflex/infra-sequelize-v6';
import { IUserProfileRepository, TUserProfile } from '@omniflex/module-identity-core/types';

export class UserProfileRepository
  extends SequelizeRepository<TUserProfile>
  implements IUserProfileRepository {
  constructor(model: TModel<Model<TUserProfile>>) {
    super(model);
  }
}
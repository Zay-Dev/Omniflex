import { Model } from 'sequelize';
import { TModel, SequelizeRepository } from '@omniflex/infra-sequelize-v6';
import { IUserRepository, TUser } from '@omniflex/module-identity-core/types';

export class UserRepository
  extends SequelizeRepository<TUser>
  implements IUserRepository<TUser> {
  constructor(model: TModel<Model<TUser>>) {
    super(model);
  }
}
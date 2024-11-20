import { Model } from 'sequelize';
import { TModel, PostgresRepository } from '@omniflex/infra-postgres';
import { IUserRepository, TUser } from '@omniflex/module-identity-core/types';

export class UserRepository
  extends PostgresRepository<TUser>
  implements IUserRepository<TUser> {
  constructor(model: TModel<Model<TUser>>) {
    super(model);
  }
}
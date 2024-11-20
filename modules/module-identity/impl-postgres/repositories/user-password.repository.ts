import { Model } from 'sequelize';
import { TModel, PostgresRepository } from '@omniflex/infra-postgres';
import { IUserPasswordRepository, TUserPassword } from '@omniflex/module-identity-core/types';

export class UserPasswordRepository
  extends PostgresRepository<TUserPassword>
  implements IUserPasswordRepository {
  constructor(model: TModel<Model<TUserPassword>>) {
    super(model);
  }

  async findByUsername(username: string) {
    return this.findOne({ username, isDeleted: false });
  }
}
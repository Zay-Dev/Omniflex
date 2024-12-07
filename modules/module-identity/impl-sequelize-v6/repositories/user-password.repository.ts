import { Model } from 'sequelize';
import { TModel, SequelizeRepository } from '@omniflex/infra-sequelize-v6';
import { IUserPasswordRepository, TUserPassword } from '@omniflex/module-identity-core/types';

export class UserPasswordRepository
  extends SequelizeRepository<TUserPassword>
  implements IUserPasswordRepository {
  constructor(model: TModel<Model<TUserPassword>>) {
    super(model);
  }

  async findByUsername(username: string) {
    return this.findOne({ username, isDeleted: false });
  }
}
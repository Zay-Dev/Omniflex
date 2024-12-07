import { Model } from 'sequelize';
import { TModel, SequelizeRepository } from '@omniflex/infra-sequelize-v6';
import { ILoginAttemptRepository, TLoginAttempt } from '@omniflex/module-identity-core/types';

export class LoginAttemptRepository
  extends SequelizeRepository<TLoginAttempt>
  implements ILoginAttemptRepository {
  constructor(model: TModel<Model<TLoginAttempt>>) {
    super(model);
  }
}
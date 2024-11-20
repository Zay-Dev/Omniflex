import { Model } from 'sequelize';
import { TModel, PostgresRepository } from '@omniflex/infra-postgres';
import { ILoginAttemptRepository, TLoginAttempt } from '@omniflex/module-identity-core/types';

export class LoginAttemptRepository
  extends PostgresRepository<TLoginAttempt>
  implements ILoginAttemptRepository {
  constructor(model: TModel<Model<TLoginAttempt>>) {
    super(model);
  }
}
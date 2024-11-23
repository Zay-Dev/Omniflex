import { Model } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { ILoginAttemptRepository, TLoginAttempt } from '@omniflex/module-identity-core/types';

export class LoginAttemptRepository
  extends MongooseBaseRepository<TLoginAttempt>
  implements ILoginAttemptRepository {
  constructor(model: Model<TLoginAttempt>) {
    super(model);
  }
}
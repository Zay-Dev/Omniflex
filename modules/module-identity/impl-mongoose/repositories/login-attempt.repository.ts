import { Model, Document } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { ILoginAttemptRepository, TLoginAttempt } from '@omniflex/module-identity-core/types';

export class LoginAttemptRepository
  extends MongooseBaseRepository<TLoginAttempt & Document>
  implements ILoginAttemptRepository {
  constructor(model: Model<TLoginAttempt & Document>) {
    super(model);
  }
}
import { Model, Document } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { ILoginAttemptRepository, TUser, TLoginAttempt } from '@omniflex/module-identity-core/types';

export class LoginAttemptRepository
  extends MongooseBaseRepository<TLoginAttempt & Document>
  implements ILoginAttemptRepository {
  constructor(model: Model<TLoginAttempt & Document>) {
    super(model);
  }

  async findByUser(user: TUser) {
    return this.find({ user, isDeleted: false });
  }
}
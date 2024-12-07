import { Model } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserPasswordRepository, TUserPassword } from '@omniflex/module-identity-core/types';

export class UserPasswordRepository
  extends MongooseBaseRepository<TUserPassword>
  implements IUserPasswordRepository {
  constructor(model: Model<TUserPassword>) {
    super(model);
  }

  async findByUsername(username: string) {
    return this.findOne({ username, deletedAt: null });
  }
}
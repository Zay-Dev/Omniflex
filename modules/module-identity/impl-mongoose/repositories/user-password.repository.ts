import { Model, Document } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserPasswordRepository, TUserPassword } from '@omniflex/module-identity-core/types';

export class UserPasswordRepository
  extends MongooseBaseRepository<TUserPassword & Document>
  implements IUserPasswordRepository {
  constructor(model: Model<TUserPassword & Document>) {
    super(model);
  }

  async findByUsername(username: string) {
    return this.findOne({ username, isDeleted: false });
  }
}
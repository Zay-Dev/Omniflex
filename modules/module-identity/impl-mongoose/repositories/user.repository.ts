import { Model, Document } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserRepository, TUser } from '@omniflex/module-identity-core/types';

export class UserRepository
  extends MongooseBaseRepository<TUser & Document>
  implements IUserRepository<TUser> {
  constructor(model: Model<TUser & Document>) {
    super(model);
  }
}
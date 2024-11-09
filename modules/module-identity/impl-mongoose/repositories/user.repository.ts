import { Model, Document } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserRepository, TUser } from '@omniflex/module-identity-core/types';

export class UserRepository
  extends MongooseBaseRepository<TUser & Document>
  implements IUserRepository {
  constructor(model: Model<TUser & Document>) {
    super(model);
  }

  async findByIdentifier(identifier: string) {
    return this.findOne({ identifier, isDeleted: false });
  }

  async findByUsername(username: string) {
    return this.model.findOne({ 'password.username': username });
  }

  async findByEmail(email: string) {
    return this.model.findOne({ 'profile.email': email });
  }
}
import { Model, Document } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserRepository, TUser } from '@omniflex/module-identity-core/types';

export class UserRepository
  extends MongooseBaseRepository<TUser & Document>
  implements IUserRepository<string> {
  constructor(model: Model<TUser & Document>) {
    super(model);
  }

  async findByIdentifier(identifier: string): Promise<TUser | null> {
    return this.findOne({ identifier, isDeleted: false });
  }

  async findByUsername(username: string): Promise<TUser | null> {
    return this.model.findOne({ 'password.username': username });
  }

  async findByEmail(email: string): Promise<TUser | null> {
    return this.model.findOne({ 'profile.email': email });
  }
}
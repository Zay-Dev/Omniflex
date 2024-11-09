import { Model, Document } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserProfileRepository, TUser, TUserProfile } from '@omniflex/module-identity-core/types';

export class UserProfileRepository
  extends MongooseBaseRepository<TUserProfile & Document>
  implements IUserProfileRepository<string> {
  constructor(model: Model<TUserProfile & Document>) {
    super(model);
  }

  async findByUser(user: TUser): Promise<TUserProfile | null> {
    return this.findOne({ user, isDeleted: false });
  }

  async findByEmail(email: string): Promise<TUserProfile | null> {
    return this.findOne({ email, isDeleted: false });
  }
}
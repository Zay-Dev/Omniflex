import { Model, Document } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserProfileRepository, TUser, TUserProfile } from '@omniflex/module-identity-core/types';

export class UserProfileRepository
  extends MongooseBaseRepository<TUserProfile & Document>
  implements IUserProfileRepository {
  constructor(model: Model<TUserProfile & Document>) {
    super(model);
  }
}
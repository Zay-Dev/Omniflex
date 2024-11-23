import { Model } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserProfileRepository, TUserProfile } from '@omniflex/module-identity-core/types';

export class UserProfileRepository
  extends MongooseBaseRepository<TUserProfile>
  implements IUserProfileRepository {
  constructor(model: Model<TUserProfile>) {
    super(model);
  }
}
import { Model, Schema } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserProfileRepository, TUserProfile } from '@omniflex/module-identity-core/types';

import {
  mixed,
  deletedAt,
  optionalString,
  toRequiredObjectId,
} from '@omniflex/infra-mongoose/types';

export class UserProfileRepository
  extends MongooseBaseRepository<TUserProfile>
  implements IUserProfileRepository {
  constructor(model: Model<TUserProfile>) {
    super(model);
  }
}

export const baseDefinition = {
  deletedAt,

  profileImage: optionalString,
  email: optionalString,
  mobileNumber: optionalString,
  firstName: optionalString,
  lastName: optionalString,
  profile: mixed,

  userId: toRequiredObjectId('Users'),
};

export const defineSchema = <T extends TUserProfile = TUserProfile>(
  schema: typeof baseDefinition & Record<string, any> = baseDefinition,
) => {
  const profile = new Schema<T>(
    schema,
    { timestamps: true },
  );

  profile.virtual('user', {
    ref: 'Users',
    justOne: true,
    foreignField: '_id',
    localField: 'userId',
  });

  return profile;
}; 
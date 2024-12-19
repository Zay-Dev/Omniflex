import { Containers } from '@omniflex/core';
import { Model, Schema, Connection } from 'mongoose';
import * as Types from '@omniflex/infra-mongoose/types';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserProfileRepository, TUserProfile } from '@omniflex/module-identity-core/types';

const appContainer = Containers.appContainerAs<{ mongoose: Connection; }>();

export class UserProfiles extends MongooseBaseRepository<TUserProfile>
  implements IUserProfileRepository {
  constructor(model: Model<TUserProfile>) {
    super(model);
  }
}

export const baseDefinition = {
  deletedAt: Types.deletedAt,

  profileImage: Types.optionalString,
  email: Types.optionalString,
  mobileNumber: Types.optionalString,
  firstName: Types.optionalString,
  lastName: Types.optionalString,
  profile: Types.mixed,

  userId: Types.toRequiredObjectId('Users'),
};

export const defineSchema = (
  schema: typeof baseDefinition & Record<string, any> = baseDefinition,
) => {
  const profile = new Schema<TUserProfile>(
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

export const createRepository = (
  schemaOrDefinition?: Schema<TUserProfile> | typeof baseDefinition,
) => {
  const mongoose = appContainer.resolve('mongoose');

  const schema = schemaOrDefinition instanceof Schema ?
    schemaOrDefinition as Schema<TUserProfile> :
    defineSchema(schemaOrDefinition);

  const model = mongoose.model<TUserProfile>('UserProfiles', schema);

  return new UserProfiles(model);
}; 
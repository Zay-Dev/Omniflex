import { Containers } from '@omniflex/core';
import { Model, Schema, Connection } from 'mongoose';
import * as Types from '@omniflex/infra-mongoose/types';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserProfileRepository, TUserProfile } from '@omniflex/module-identity-core/types';

const appContainer = Containers.appContainerAs<{ mongoose: Connection; }>();

export class UserProfiles<T extends TUserProfile = TUserProfile>
  extends MongooseBaseRepository<T>
  implements IUserProfileRepository {
  constructor(model: Model<T>) {
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

export const createRepository = <T extends TUserProfile = TUserProfile>(
  schemaOrDefinition?: Schema<T> | typeof baseDefinition,
) => {
  const mongoose = appContainer.resolve('mongoose');

  const schema = schemaOrDefinition instanceof Schema ?
    schemaOrDefinition as Schema<T> :
    defineSchema<T>(schemaOrDefinition);

  const model = mongoose.model<T>('UserProfiles', schema);

  return new UserProfiles<T>(model);
}; 
import { Containers } from '@omniflex/core';
import { Model, Schema, Connection } from 'mongoose';
import * as Types from '@omniflex/infra-mongoose/types';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserRepository, TUser } from '@omniflex/module-identity-core/types';

const appContainer = Containers.appContainerAs<{ mongoose: Connection; }>();

export class Users extends MongooseBaseRepository<TUser> implements IUserRepository {
  constructor(model: Model<TUser>) {
    super(model);
  }
}

export const baseDefinition = {
  deletedAt: Types.deletedAt,

  isVerified: Types.defaultFalse,
  identifier: Types.requiredString,
  lastSignInAtUtc: Types.optionalDate,
};

export const defineSchema = (
  schema: typeof baseDefinition & Record<string, any> = baseDefinition,
) => {
  const user = new Schema<TUser>(
    schema,
    { timestamps: true },
  );

  user.index({ identifier: 1 }, {
    unique: true,
    partialFilterExpression: { deletedAt: null }
  });

  return user;
};

export const createRepository = (
  schemaOrDefinition?: Schema<TUser> | typeof baseDefinition,
) => {
  const mongoose = appContainer.resolve('mongoose');

  const schema = schemaOrDefinition instanceof Schema ?
    schemaOrDefinition as Schema<TUser> :
    defineSchema(schemaOrDefinition);

  const model = mongoose.model<TUser>('Users', schema);

  return new Users(model);
}; 
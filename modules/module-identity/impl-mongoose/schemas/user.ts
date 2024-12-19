import { Containers } from '@omniflex/core';
import { Model, Schema, Connection } from 'mongoose';
import * as Types from '@omniflex/infra-mongoose/types';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserRepository, TUser } from '@omniflex/module-identity-core/types';

const appContainer = Containers.appContainerAs<{ mongoose: Connection; }>();

export class Users<T extends TUser = TUser>
  extends MongooseBaseRepository<T>
  implements IUserRepository<T> {
  constructor(model: Model<T>) {
    super(model);
  }
}

export const baseDefinition = {
  deletedAt: Types.deletedAt,

  isVerified: Types.defaultFalse,
  identifier: Types.requiredString,
  lastSignInAtUtc: Types.optionalDate,
};

export const defineSchema = <T extends TUser = TUser>(
  schema: typeof baseDefinition & Record<string, any> = baseDefinition,
) => {
  const user = new Schema<T>(
    schema,
    { timestamps: true },
  );

  user.index({ identifier: 1 }, {
    unique: true,
    partialFilterExpression: { deletedAt: null }
  });

  return user;
};

export const createRepository = <T extends TUser = TUser>(
  schemaOrDefinition?: Schema<T> | typeof baseDefinition,
) => {
  const mongoose = appContainer.resolve('mongoose');

  const schema = schemaOrDefinition instanceof Schema ?
    schemaOrDefinition as Schema<T> :
    defineSchema<T>(schemaOrDefinition);

  const model = mongoose.model<T>('Users', schema);

  return new Users<T>(model);
}; 
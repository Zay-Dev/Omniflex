import { Containers } from '@omniflex/core';
import { Schema, Connection } from 'mongoose';
import * as Types from '@omniflex/infra-mongoose/types';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserPasswordRepository, TUserPassword } from '@omniflex/module-identity-core/types';

const appContainer = Containers.appContainerAs<{ mongoose: Connection; }>();

export class UserPasswords extends MongooseBaseRepository<TUserPassword>
  implements IUserPasswordRepository {
  async findByUsername(username: string) {
    return this.findOne({ username, deletedAt: null });
  }
}

export const baseDefinition = {
  deletedAt: Types.deletedAt,

  salt: Types.requiredString,
  username: Types.requiredString,
  hashedPassword: Types.requiredString,

  userId: Types.toRequiredObjectId('Users'),
};

export const defineSchema = (
  schema: typeof baseDefinition & Record<string, any> = baseDefinition,
) => {
  const password = new Schema<TUserPassword>(
    schema,
    { timestamps: true },
  );

  password.virtual('user', {
    ref: 'Users',
    justOne: true,
    foreignField: '_id',
    localField: 'userId',
  });

  password.index({ username: 1 }, {
    unique: true,
    partialFilterExpression: { deletedAt: null }
  });

  return password;
};

export const createRepository = (
  schemaOrDefinition?: Schema<TUserPassword> | typeof baseDefinition,
) => {
  const mongoose = appContainer.resolve('mongoose');

  const schema = schemaOrDefinition instanceof Schema ?
    schemaOrDefinition as Schema<TUserPassword> :
    defineSchema(schemaOrDefinition);

  const model = mongoose.model<TUserPassword>('UserPasswords', schema);

  return new UserPasswords(model);
};
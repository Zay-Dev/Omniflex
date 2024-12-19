import { Containers } from '@omniflex/core';
import { Model, Schema, Connection } from 'mongoose';
import * as Types from '@omniflex/infra-mongoose/types';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserPasswordRepository, TUserPassword } from '@omniflex/module-identity-core/types';

const appContainer = Containers.appContainerAs<{ mongoose: Connection; }>();

export class UserPasswords<T extends TUserPassword = TUserPassword>
  extends MongooseBaseRepository<T>
  implements IUserPasswordRepository {
  constructor(model: Model<T>) {
    super(model);
  }

  async findByUsername(username: string) {
    return this.findOne({ username, deletedAt: { $eq: null } } as any);
  }
}

export const baseDefinition = {
  deletedAt: Types.deletedAt,

  salt: Types.requiredString,
  username: Types.requiredString,
  hashedPassword: Types.requiredString,

  userId: Types.toRequiredObjectId('Users'),
};

export const defineSchema = <T extends TUserPassword = TUserPassword>(
  schema: typeof baseDefinition & Record<string, any> = baseDefinition,
) => {
  const password = new Schema<T>(
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

export const createRepository = <T extends TUserPassword = TUserPassword>(
  schemaOrDefinition?: Schema<T> | typeof baseDefinition,
) => {
  const mongoose = appContainer.resolve('mongoose');

  const schema = schemaOrDefinition instanceof Schema ?
    schemaOrDefinition as Schema<T> :
    defineSchema<T>(schemaOrDefinition);

  const model = mongoose.model<T>('UserPasswords', schema);

  return new UserPasswords<T>(model);
}; 
import { Model, Schema } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserPasswordRepository, TUserPassword } from '@omniflex/module-identity-core/types';

import {
  deletedAt,
  requiredString,
  toRequiredObjectId,
} from '@omniflex/infra-mongoose/types';

export class UserPasswordRepository
  extends MongooseBaseRepository<TUserPassword>
  implements IUserPasswordRepository {
  constructor(model: Model<TUserPassword>) {
    super(model);
  }

  async findByUsername(username: string) {
    return this.findOne({ username, deletedAt: null });
  }
}

export const baseDefinition = {
  deletedAt,

  salt: requiredString,
  username: requiredString,
  hashedPassword: requiredString,

  userId: toRequiredObjectId('Users'),
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
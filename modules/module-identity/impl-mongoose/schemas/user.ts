import { Model, Schema } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserRepository, TUser } from '@omniflex/module-identity-core/types';

import {
  deletedAt,
  defaultFalse,
  optionalDate,
  requiredString,
} from '@omniflex/infra-mongoose/types';

export class UserRepository
  extends MongooseBaseRepository<TUser>
  implements IUserRepository<TUser> {
  constructor(model: Model<TUser>) {
    super(model);
  }
}

export const baseDefinition = {
  deletedAt,

  isVerified: defaultFalse,
  identifier: requiredString,
  lastSignInAtUtc: optionalDate,
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
import { Model, Schema } from 'mongoose';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { ILoginAttemptRepository, TLoginAttempt } from '@omniflex/module-identity-core/types';

import {
  mixed,
  deletedAt,
  requiredString,
  optionalString,
  toOptionalObjectId,
} from '@omniflex/infra-mongoose/types';

export class LoginAttemptRepository
  extends MongooseBaseRepository<TLoginAttempt>
  implements ILoginAttemptRepository {
  constructor(model: Model<TLoginAttempt>) {
    super(model);
  }
}

export const baseDefinition = {
  deletedAt,

  identifier: requiredString,
  loginType: requiredString,
  appType: requiredString,
  success: { type: Boolean, required: true },
  remoteAddress: optionalString,
  remark: mixed,

  userId: toOptionalObjectId('Users'),
};

export const defineSchema = <T extends TLoginAttempt = TLoginAttempt>(
  schema: typeof baseDefinition & Record<string, any> = baseDefinition,
) => {
  const loginAttempt = new Schema<T>(
    schema,
    { timestamps: true },
  );

  loginAttempt.virtual('user', {
    ref: 'Users',
    justOne: true,
    foreignField: '_id',
    localField: 'userId',
  });

  return loginAttempt;
}; 
import { Containers } from '@omniflex/core';
import { Model, Schema, Connection } from 'mongoose';
import * as Types from '@omniflex/infra-mongoose/types';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { ILoginAttemptRepository, TLoginAttempt } from '@omniflex/module-identity-core/types';

const appContainer = Containers.appContainerAs<{ mongoose: Connection; }>();

export class LoginAttempts<T extends TLoginAttempt = TLoginAttempt>
  extends MongooseBaseRepository<T>
  implements ILoginAttemptRepository {
  constructor(model: Model<T>) {
    super(model);
  }
}

export const baseDefinition = {
  identifier: Types.requiredString,
  loginType: Types.requiredString,
  appType: Types.requiredString,
  success: { type: Boolean, required: true },
  remoteAddress: Types.optionalString,
  remark: Types.mixed,

  userId: Types.toOptionalObjectId('Users'),
  deletedAt: Types.deletedAt,
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

export const createRepository = <T extends TLoginAttempt = TLoginAttempt>(
  schemaOrDefinition?: Schema<T> | typeof baseDefinition,
) => {
  const mongoose = appContainer.resolve('mongoose');

  const schema = schemaOrDefinition instanceof Schema ?
    schemaOrDefinition as Schema<T> :
    defineSchema<T>(schemaOrDefinition);

  const model = mongoose.model<T>('LoginAttempts', schema);

  return new LoginAttempts<T>(model);
};
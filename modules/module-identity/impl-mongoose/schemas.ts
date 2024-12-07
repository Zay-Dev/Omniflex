import { Schema, Document } from 'mongoose';
import { TUser, TUserProfile, TUserPassword, TLoginAttempt } from '@omniflex/module-identity-core/types';

import {
  mixed,
  deletedAt,
  defaultFalse,
  optionalDate,
  requiredString,
  optionalString,
  toRequiredObjectId,
  toOptionalObjectId,
} from '@omniflex/infra-mongoose/types';

export const userBaseSchema = {
  deletedAt,

  isVerified: defaultFalse,
  identifier: requiredString,
  lastSignInAtUtc: optionalDate,
};

export const profileBaseSchema = {
  deletedAt,

  profileImage: optionalString,
  email: optionalString,
  mobileNumber: optionalString,
  firstName: optionalString,
  lastName: optionalString,
  profile: mixed,

  userId: toRequiredObjectId('Users'),
};

export const passwordBaseSchema = {
  deletedAt,

  salt: requiredString,
  username: requiredString,
  hashedPassword: requiredString,

  userId: toRequiredObjectId('Users'),
};

export const loginAttemptBaseSchema = {
  deletedAt,

  identifier: requiredString,
  loginType: requiredString,
  appType: requiredString,
  success: { type: Boolean, required: true },
  remoteAddress: optionalString,
  remark: mixed,

  userId: toOptionalObjectId('Users'),
};

export const getUserSchema = <T extends TUser = TUser>(
  schema: typeof userBaseSchema & Record<string, any> = userBaseSchema,
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

export const getProfileSchema = <T extends TUserProfile = TUserProfile>(
  schema: typeof profileBaseSchema & Record<string, any> = profileBaseSchema,
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

export const getPasswordSchema = <T extends TUserPassword = TUserPassword>(
  schema: typeof passwordBaseSchema & Record<string, any> = passwordBaseSchema,
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

export const getLoginAttemptSchema = <T extends TLoginAttempt = TLoginAttempt>(
  schema: typeof loginAttemptBaseSchema & Record<string, any> = loginAttemptBaseSchema,
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
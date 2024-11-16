import { Schema, Document } from 'mongoose';
import { TUser, TUserProfile, TUserPassword, TLoginAttempt } from '@omniflex/module-identity-core/types';

import {
  defaultFalse,
  requiredString,
  optionalDate,
  optionalString,
  mixed,
  toRequiredObjectId,
  isDeleted,
} from '@omniflex/infra-mongoose/types';

export const userBaseSchema = {
  isDeleted,
  isVerified: defaultFalse,
  identifier: requiredString,
  lastSignInAtUtc: optionalDate,
};

export const profileBaseSchema = {
  user: toRequiredObjectId('Users'),
  isDeleted,
  profileImage: optionalString,
  email: optionalString,
  mobileNumber: optionalString,
  firstName: optionalString,
  lastName: optionalString,
  profile: mixed,
};

export const passwordBaseSchema = {
  user: toRequiredObjectId('Users'),
  isDeleted,
  username: requiredString,
  hashedPassword: requiredString,
};

export const loginAttemptBaseSchema = {
  user: toRequiredObjectId('Users'),
  isDeleted,
  identifier: requiredString,
  loginType: requiredString,
  appType: requiredString,
  success: { type: Boolean, required: true },
  ipAddress: optionalString,
  remark: mixed,
};

export const getUserSchema = <T extends TUser = TUser>(
  schema: typeof userBaseSchema & Record<string, any> = userBaseSchema,
) => {
  const user = new Schema<T & Document>(
    schema,
    { timestamps: true },
  );

  // Only enforce uniqueness for active records
  user.index({ identifier: 1 }, {
    unique: true,
    partialFilterExpression: { isDeleted: false }
  });

  return user;
};

export const getProfileSchema = <T extends TUserProfile = TUserProfile>(
  schema: typeof profileBaseSchema & Record<string, any> = profileBaseSchema,
) => {
  const profile = new Schema<TUserProfile & T & Document>(
    schema,
    { timestamps: true },
  );

  return profile;
};

export const getPasswordSchema = <T extends TUserPassword = TUserPassword>(
  schema: typeof passwordBaseSchema & Record<string, any> = passwordBaseSchema,
) => {
  const password = new Schema<TUserPassword & T & Document>(
    schema,
    { timestamps: true },
  );

  // Only enforce uniqueness for active records
  password.index({ username: 1 }, {
    unique: true,
    partialFilterExpression: { isDeleted: false }
  });

  return password;
};

export const getLoginAttemptSchema = <T extends TLoginAttempt = TLoginAttempt>(
  schema: typeof loginAttemptBaseSchema & Record<string, any> = loginAttemptBaseSchema,
) => {
  const loginAttempt = new Schema<TLoginAttempt & T & Document>(
    schema,
    { timestamps: true },
  );

  return loginAttempt;
};
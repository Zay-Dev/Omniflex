import { Schema } from 'mongoose';
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

export const UserSchema = new Schema<TUser>({
  isDeleted,
  isVerified: defaultFalse,
  identifier: requiredString,
  lastSignInAtUtc: optionalDate,
}, {
  timestamps: true,
});

export const UserProfileSchema = new Schema<TUserProfile>({
  user: toRequiredObjectId('User'),
  isDeleted,
  profileImage: optionalString,
  email: optionalString,
  mobileNumber: optionalString,
  firstName: optionalString,
  lastName: optionalString,
  profile: mixed,
}, {
  timestamps: true,
});

export const UserPasswordSchema = new Schema<TUserPassword>({
  user: toRequiredObjectId('User'),
  isDeleted,
  username: requiredString,
  hashedPassword: requiredString,
}, {
  timestamps: true,
});

export const LoginAttemptSchema = new Schema<TLoginAttempt>({
  user: toRequiredObjectId('User'),
  isDeleted,
  identifier: requiredString,
  loginType: requiredString,
  appType: requiredString,
  success: { type: Boolean, required: true },
  ipAddress: optionalString,
  remark: mixed,
}, {
  timestamps: true,
});

// Only enforce uniqueness for active records
UserSchema.index({ identifier: 1 }, {
  unique: true,
  partialFilterExpression: { isDeleted: false }
});

// Only enforce uniqueness for active records
UserPasswordSchema.index({ username: 1 }, {
  unique: true,
  partialFilterExpression: { isDeleted: false }
});
import { Schema } from 'mongoose';
import { TUserSession } from '@omniflex/module-user-session-core/types';

import {
  mixed,
  isDeleted,
  defaultFalse,
  requiredDate,
  requiredString,
  optionalString,
  toRequiredObjectId,
} from '@omniflex/infra-mongoose/types';

export const sessionBaseSchema = {
  isDeleted,

  sessionType: requiredString,
  isActive: defaultFalse,
  expiredAt: requiredDate,

  ipAddress: optionalString,
  userAgent: optionalString,
  deviceInfo: mixed,
  metadata: mixed,

  userId: toRequiredObjectId('Users'),
};

export const getSessionSchema = <T extends TUserSession = TUserSession>(
  schema: typeof sessionBaseSchema & Record<string, any> = sessionBaseSchema,
) => {
  const session = new Schema<T>(
    schema,
    { timestamps: true },
  );

  session.virtual('user', {
    ref: 'Users',
    justOne: true,
    foreignField: '_id',
    localField: 'userId',
  });

  session.index(
    { userId: 1, sessionType: 1, isActive: 1 },
    { partialFilterExpression: { isDeleted: false } }
  );

  return session;
};
import { Containers } from '@omniflex/core';
import { Model, Schema, Connection } from 'mongoose';
import * as Types from '@omniflex/infra-mongoose/types';
import { MongooseBaseRepository } from '@omniflex/infra-mongoose';
import { IUserSessionRepository, TUserSession } from '@omniflex/module-user-session-core/types';

const appContainer = Containers.appContainerAs<{ mongoose: Connection; }>();

export class UserSessions extends MongooseBaseRepository<TUserSession>
  implements IUserSessionRepository {
  constructor(model: Model<TUserSession>) {
    super(model);
  }

  async deactivateByUserId(userId: string) {
    await this.model.updateMany(
      { userId, isActive: true, deletedAt: null },
      { isActive: false }
    );
  }

  async deactivateBySessionType(userId: string, sessionType: string) {
    await this.model.updateMany(
      {
        userId,
        sessionType,
        isActive: true,
        deletedAt: null
      },
      { isActive: false }
    );
  }
}

export const baseDefinition = {
  sessionType: Types.requiredString,

  isActive: Types.defaultFalse,
  expiredAt: Types.requiredDate,
  identifier: Types.requiredString,
  pairIdentifier: Types.requiredString,

  metadata: Types.mixed,
  deviceInfo: Types.mixed,
  userAgent: Types.optionalString,
  remoteAddress: Types.optionalString,

  userId: Types.toRequiredObjectId('Users'),
  deletedAt: Types.deletedAt,
};

export const defineSchema = (
  schema: typeof baseDefinition & Record<string, any> = baseDefinition,
) => {
  const session = new Schema<TUserSession>(
    schema,
    { timestamps: true }
  );

  session.virtual('user', {
    ref: 'Users',
    justOne: true,
    foreignField: '_id',
    localField: 'userId',
  });

  session.index(
    { userId: 1, sessionType: 1, isActive: 1 },
    { partialFilterExpression: { deletedAt: null } }
  );

  return session;
};

export const createRepository = (
  schemaOrDefinition?: Schema<TUserSession> | typeof baseDefinition,
) => {
  const mongoose = appContainer.resolve('mongoose');

  const schema = schemaOrDefinition instanceof Schema ?
    schemaOrDefinition as Schema<TUserSession> :
    defineSchema(schemaOrDefinition);

  const model = mongoose.model<TUserSession>('UserSessions', schema);

  return new UserSessions(model);
};
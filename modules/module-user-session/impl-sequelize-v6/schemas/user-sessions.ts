import { Containers } from '@omniflex/core';
import { Model, Sequelize } from 'sequelize';

import * as Types from '@omniflex/infra-sequelize-v6/types';
import { TModel, SequelizeRepository } from '@omniflex/infra-sequelize-v6';
import { IUserSessionRepository, TUserSession } from '@omniflex/module-user-session-core/types';

type TOptions = Omit<Parameters<typeof Model.init>[1], 'sequelize'>;

type TSchemaOrModelOrRepository =
  UserSessions |
  TModel<Model<TUserSession>> |
  ReturnType<typeof getDefinition>;

const appContainer = Containers.appContainerAs<{ sequelize: Sequelize; }>();

export class UserSessions
  extends SequelizeRepository<TUserSession>
  implements IUserSessionRepository {
  async deactivateByUserId(userId: string) {
    await this.model.update(
      { isActive: false },
      { where: { userId, isActive: true } }
    );
  }

  async deactivateBySessionType(userId: string, sessionType: string) {
    await this.model.update(
      { isActive: false },
      {
        where: {
          userId,
          sessionType,
          isActive: true
        }
      }
    );
  }
}

export const baseDefinition = {
  id: Types.id('UUID'),
  sessionType: Types.requiredString(),

  isActive: Types.defaultFalse(),
  expiredAt: Types.requiredDate(),
  identifier: Types.requiredString(),
  pairIdentifier: Types.requiredString(),

  metadata: Types.mixed(),
  deviceInfo: Types.mixed(),
  userAgent: Types.optionalString(),
  remoteAddress: Types.optionalString(),

  userId: {
    ...Types.toRequired(Types.id('UUID', false)),

    references: {
      key: 'id',
      model: 'Users',
    },
  },

  deletedAt: Types.deletedAt(),
};

export const getDefinition = (
  schema: typeof baseDefinition & Record<string, any> = baseDefinition,
) => {
  return {
    schema,
    options: {
      paranoid: true,
      tableName: 'UserSessions',
      indexes: [
        {
          fields: ['userId', 'sessionType', 'isActive'],
          where: { deletedAt: null },
        },
      ],
    } as TOptions,
  };
};

export const createRepository = (
  modelOrSchemas?: TSchemaOrModelOrRepository,
) => {
  if (modelOrSchemas instanceof UserSessions) {
    return modelOrSchemas;
  }

  if (modelOrSchemas instanceof Model) {
    return new UserSessions(
      modelOrSchemas as TModel<Model<TUserSession>>
    );
  }

  const sequelize = appContainer.resolve('sequelize');
  const { schema, options } = modelOrSchemas || getDefinition();

  const model = sequelize.define(
    options.modelName || 'UserSession',
    {
      ...baseDefinition,
      ...schema,
    },
    options,
  );

  return new UserSessions(model);
};
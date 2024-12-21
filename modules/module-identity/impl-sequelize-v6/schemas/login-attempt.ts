import { Containers } from '@omniflex/core';
import { Model, Sequelize } from 'sequelize';

import * as Types from '@omniflex/infra-sequelize-v6/types';
import { TModel, SequelizeRepository } from '@omniflex/infra-sequelize-v6';
import { ILoginAttemptRepository, TLoginAttempt } from '@omniflex/module-identity-core/types';

type TOptions = Omit<Parameters<typeof Model.init>[1], 'sequelize'>;

type TSchemaOrModelOrRepository =
  LoginAttempts |
  TModel<Model<TLoginAttempt>> |
  ReturnType<typeof getDefinition>;

const appContainer = Containers.appContainerAs<{ sequelize: Sequelize; }>();

export class LoginAttempts
  extends SequelizeRepository<TLoginAttempt>
  implements ILoginAttemptRepository {}

export const baseDefinition = {
  id: Types.id('UUID'),

  identifier: Types.requiredString(),
  loginType: Types.requiredString(),
  appType: Types.requiredString(),
  success: Types.requiredBoolean(),
  remoteAddress: Types.optionalString(),
  remark: Types.mixed(),

  userId: {
    ...Types.toOptional(Types.id('UUID', false)),
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
      tableName: 'LoginAttempts',
    } as TOptions,
  };
};

export const createRepository = (
  modelOrSchemas?: TSchemaOrModelOrRepository,
) => {
  if (modelOrSchemas instanceof LoginAttempts) {
    return modelOrSchemas;
  }

  if (modelOrSchemas instanceof Model) {
    return new LoginAttempts(
      modelOrSchemas as TModel<Model<TLoginAttempt>>
    );
  }

  const sequelize = appContainer.resolve('sequelize');
  const { schema, options } = modelOrSchemas || getDefinition();

  const model = sequelize.define(
    options.modelName || 'LoginAttempts',
    {
      ...baseDefinition,
      ...schema,
    },
    options,
  );

  return new LoginAttempts(model);
};
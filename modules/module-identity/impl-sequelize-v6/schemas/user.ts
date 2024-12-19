import { Containers } from '@omniflex/core';
import { Model, Sequelize } from 'sequelize';

import * as Types from '@omniflex/infra-sequelize-v6/types';
import { TModel, SequelizeRepository } from '@omniflex/infra-sequelize-v6';
import { IUserRepository, TUser } from '@omniflex/module-identity-core/types';

type TOptions = Omit<Parameters<typeof Model.init>[1], 'sequelize'>;

type TSchemaOrModelOrRepository =
  Users |
  TModel<Model<TUser>> |
  ReturnType<typeof getDefinition>;

const appContainer = Containers.appContainerAs<{ sequelize: Sequelize; }>();

export class Users
  extends SequelizeRepository<TUser>
  implements IUserRepository {
  constructor(model: TModel<Model<TUser>>) {
    super(model);
  }
}

export const baseDefinition = {
  id: Types.id('UUID'),

  isVerified: Types.defaultFalse(),
  identifier: Types.requiredString(),
  lastSignInAtUtc: Types.optionalDate(),

  deletedAt: Types.deletedAt(),
};

export const getDefinition = (
  schema: typeof baseDefinition & Record<string, any> = baseDefinition,
) => {
  return {
    schema,
    options: {
      paranoid: true,
      tableName: 'Users',
      indexes: [
        {
          unique: true,
          fields: ['identifier'],
          where: { deletedAt: null },
        },
      ],
    } as TOptions,
  };
};

export const createRepository = (
  modelOrSchemas?: TSchemaOrModelOrRepository,
) => {
  if (modelOrSchemas instanceof Users) {
    return modelOrSchemas;
  }

  if (modelOrSchemas instanceof Model) {
    return new Users(
      modelOrSchemas as TModel<Model<TUser>>
    );
  }

  const sequelize = appContainer.resolve('sequelize');
  const { schema, options } = modelOrSchemas || getDefinition();

  const model = sequelize.define(
    options.modelName || 'Users',
    {
      ...baseDefinition,
      ...schema,
    },
    options,
  );

  return new Users(model);
}; 
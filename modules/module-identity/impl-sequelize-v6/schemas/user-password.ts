import { Containers } from '@omniflex/core';
import { Model, Sequelize } from 'sequelize';

import * as Types from '@omniflex/infra-sequelize-v6/types';
import { TModel, SequelizeRepository } from '@omniflex/infra-sequelize-v6';
import { IUserPasswordRepository, TUserPassword } from '@omniflex/module-identity-core/types';

type TOptions = Omit<Parameters<typeof Model.init>[1], 'sequelize'>;

type TSchemaOrModelOrRepository =
  UserPasswords |
  TModel<Model<TUserPassword>> |
  ReturnType<typeof getDefinition>;

const appContainer = Containers.appContainerAs<{ sequelize: Sequelize; }>();

export class UserPasswords
  extends SequelizeRepository<TUserPassword>
  implements IUserPasswordRepository {
  async findByUsername(username: string) {
    return this.findOne({ username });
  }
}

export const baseDefinition = {
  id: Types.id('UUID'),

  salt: Types.requiredString(),
  username: Types.requiredString(),
  hashedPassword: Types.requiredString(),

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
      tableName: 'UserPasswords',
      indexes: [
        {
          unique: true,
          fields: ['username'],
          where: { deletedAt: null },
        },
      ],
    } as TOptions,
  };
};

export const createRepository = (
  modelOrSchemas?: TSchemaOrModelOrRepository,
) => {
  if (modelOrSchemas instanceof UserPasswords) {
    return modelOrSchemas;
  }

  if (modelOrSchemas instanceof Model) {
    return new UserPasswords(
      modelOrSchemas as TModel<Model<TUserPassword>>
    );
  }

  const sequelize = appContainer.resolve('sequelize');
  const { schema, options } = modelOrSchemas || getDefinition();

  const model = sequelize.define(
    options.modelName || 'UserPasswords',
    {
      ...baseDefinition,
      ...schema,
    },
    options,
  );

  return new UserPasswords(model);
};
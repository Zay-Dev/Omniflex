import { Containers } from '@omniflex/core';
import { Model, Sequelize } from 'sequelize';

import * as Types from '@omniflex/infra-sequelize-v6/types';
import { TModel, SequelizeRepository } from '@omniflex/infra-sequelize-v6';
import { IUserProfileRepository, TUserProfile } from '@omniflex/module-identity-core/types';

type TOptions = Omit<Parameters<typeof Model.init>[1], 'sequelize'>;

type TSchemaOrModelOrRepository =
  UserProfiles |
  TModel<Model<TUserProfile>> |
  ReturnType<typeof getDefinition>;

const appContainer = Containers.appContainerAs<{ sequelize: Sequelize; }>();

export class UserProfiles
  extends SequelizeRepository<TUserProfile>
  implements IUserProfileRepository {
  constructor(model: TModel<Model<TUserProfile>>) {
    super(model);
  }
}

export const baseDefinition = {
  id: Types.id('UUID'),

  profileImage: Types.optionalString(),
  email: Types.optionalString(),
  mobileNumber: Types.optionalString(),
  firstName: Types.optionalString(),
  lastName: Types.optionalString(),
  profile: Types.mixed(),

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
      tableName: 'UserProfiles',
    } as TOptions,
  };
};

export const createRepository = (
  modelOrSchemas?: TSchemaOrModelOrRepository,
) => {
  if (modelOrSchemas instanceof UserProfiles) {
    return modelOrSchemas;
  }

  if (modelOrSchemas instanceof Model) {
    return new UserProfiles(
      modelOrSchemas as TModel<Model<TUserProfile>>
    );
  }

  const sequelize = appContainer.resolve('sequelize');
  const { schema, options } = modelOrSchemas || getDefinition();

  const model = sequelize.define(
    options.modelName || 'UserProfiles',
    {
      ...baseDefinition,
      ...schema,
    },
    options,
  );

  return new UserProfiles(model);
}; 
import { Model } from 'sequelize';
import * as Types from '@omniflex/infra-sequelize-v6/types';
import { TModel, SequelizeRepository } from '@omniflex/infra-sequelize-v6';
import { IUserRepository, TUser } from '@omniflex/module-identity-core/types';

export class UserRepository
  extends SequelizeRepository<TUser>
  implements IUserRepository<TUser> {
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

export const defineSchema = (
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
    },
  };
}; 
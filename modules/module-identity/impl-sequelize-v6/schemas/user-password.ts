import { Model } from 'sequelize';
import * as Types from '@omniflex/infra-sequelize-v6/types';
import { TModel, SequelizeRepository } from '@omniflex/infra-sequelize-v6';
import { IUserPasswordRepository, TUserPassword } from '@omniflex/module-identity-core/types';

export class UserPasswordRepository
  extends SequelizeRepository<TUserPassword>
  implements IUserPasswordRepository {
  constructor(model: TModel<Model<TUserPassword>>) {
    super(model);
  }

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

export const defineSchema = (
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
    },
  };
}; 
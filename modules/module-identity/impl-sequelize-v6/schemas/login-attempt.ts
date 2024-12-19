import { Model } from 'sequelize';
import * as Types from '@omniflex/infra-sequelize-v6/types';
import { TModel, SequelizeRepository } from '@omniflex/infra-sequelize-v6';
import { ILoginAttemptRepository, TLoginAttempt } from '@omniflex/module-identity-core/types';

export class LoginAttemptRepository
  extends SequelizeRepository<TLoginAttempt>
  implements ILoginAttemptRepository {
  constructor(model: TModel<Model<TLoginAttempt>>) {
    super(model);
  }
}

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

export const defineSchema = (
  schema: typeof baseDefinition & Record<string, any> = baseDefinition,
) => {
  return {
    schema,
    options: {
      paranoid: true,
      tableName: 'LoginAttempts',
    },
  };
}; 
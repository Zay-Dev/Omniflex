import { Model } from 'sequelize';
import * as Types from '@omniflex/infra-sequelize-v6/types';
import { TModel, SequelizeRepository } from '@omniflex/infra-sequelize-v6';
import { IUserProfileRepository, TUserProfile } from '@omniflex/module-identity-core/types';

export class UserProfileRepository
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

export const defineSchema = (
  schema: typeof baseDefinition & Record<string, any> = baseDefinition,
) => {
  return {
    schema,
    options: {
      paranoid: true,
      tableName: 'UserProfiles',
    },
  };
}; 
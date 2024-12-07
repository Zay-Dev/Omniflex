import * as Types from '@omniflex/infra-sequelize-v6/types';

export const sessionBaseSchema = {
  id: Types.id('UUID'),
  isDeleted: Types.isDeleted(),
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
};

export const getSessionSchema = (
  schema: typeof sessionBaseSchema & Record<string, any> = sessionBaseSchema,
) => {
  return {
    schema,
    options: {
      tableName: 'UserSessions',
      indexes: [
        {
          fields: ['userId', 'sessionType', 'isActive'],
          where: { isDeleted: false },
        },
      ],
    },
  };
};
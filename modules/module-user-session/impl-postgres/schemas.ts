import {
  id,
  isDeleted,
  requiredDate,
  requiredString,
  optionalString,
  defaultFalse,
  mixed,
  toRequired,
} from '@omniflex/infra-postgres/types';

export const sessionBaseSchema = {
  id: id('UUID'),
  isDeleted: isDeleted(),
  sessionType: requiredString(),

  isActive: defaultFalse(),
  expiredAt: requiredDate(),
  identifier: requiredString(),
  pairIdentifier: requiredString(),

  metadata: mixed(),
  deviceInfo: mixed(),
  userAgent: optionalString(),
  remoteAddress: optionalString(),

  userId: {
    ...toRequired(id('UUID', false)),

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
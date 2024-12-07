import * as Types from '@omniflex/infra-sequelize-v6/types';

export const userBaseSchema = {
  id: Types.id('UUID'),

  isVerified: Types.defaultFalse(),
  identifier: Types.requiredString(),
  lastSignInAtUtc: Types.optionalDate(),

  deletedAt: Types.deletedAt(),
};

export const profileBaseSchema = {
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

export const passwordBaseSchema = {
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

export const loginAttemptBaseSchema = {
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

export const getUserSchema = (
  schema: typeof userBaseSchema & Record<string, any> = userBaseSchema,
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

export const getProfileSchema = (
  schema: typeof profileBaseSchema & Record<string, any> = profileBaseSchema,
) => {
  return {
    schema,
    options: {
      paranoid: true,
      tableName: 'UserProfiles',
    },
  };
};

export const getPasswordSchema = (
  schema: typeof passwordBaseSchema & Record<string, any> = passwordBaseSchema,
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

export const getLoginAttemptSchema = (
  schema: typeof loginAttemptBaseSchema & Record<string, any> = loginAttemptBaseSchema,
) => {
  return {
    schema,
    options: {
      paranoid: true,
      tableName: 'LoginAttempts',
    },
  };
};
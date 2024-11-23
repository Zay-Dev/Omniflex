import {
  id,
  mixed,
  isDeleted,
  toRequired,
  toOptional,
  defaultFalse,
  optionalDate,
  requiredString,
  optionalString,
  requiredBoolean,
} from '@omniflex/infra-postgres/types';

export const userBaseSchema = {
  id: id('UUID'),
  isDeleted: isDeleted(),

  isVerified: defaultFalse(),
  identifier: requiredString(),
  lastSignInAtUtc: optionalDate(),
};

export const profileBaseSchema = {
  id: id('UUID'),
  isDeleted: isDeleted(),

  profileImage: optionalString(),
  email: optionalString(),
  mobileNumber: optionalString(),
  firstName: optionalString(),
  lastName: optionalString(),
  profile: mixed(),

  userId: {
    ...toRequired(id('UUID', false)),
    references: {
      key: 'id',
      model: 'Users',
    },
  },
};

export const passwordBaseSchema = {
  id: id('UUID'),
  isDeleted: isDeleted(),

  salt: requiredString(),
  username: requiredString(),
  hashedPassword: requiredString(),

  userId: {
    ...toRequired(id('UUID', false)),
    references: {
      key: 'id',
      model: 'Users',
    },
  },
};

export const loginAttemptBaseSchema = {
  id: id('UUID'),
  isDeleted: isDeleted(),

  identifier: requiredString(),
  loginType: requiredString(),
  appType: requiredString(),
  success: requiredBoolean(),
  ipAddress: optionalString(),
  remark: mixed(),

  userId: {
    ...toOptional(id('UUID', false)),
    references: {
      key: 'id',
      model: 'Users',
    },
  },
};

export const getUserSchema = (
  schema: typeof userBaseSchema & Record<string, any> = userBaseSchema,
) => {
  return {
    schema,
    options: {
      tableName: 'Users',
      indexes: [
        {
          unique: true,
          fields: ['identifier'],
          where: { isDeleted: false },
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
      tableName: 'UserPasswords',
      indexes: [
        {
          unique: true,
          fields: ['username'],
          where: { isDeleted: false },
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
      tableName: 'LoginAttempts',
    },
  };
};
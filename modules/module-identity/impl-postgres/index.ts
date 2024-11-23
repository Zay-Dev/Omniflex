import { Sequelize } from 'sequelize';
import { Containers } from '@omniflex/core';
import { registerRepositories } from '@omniflex/module-identity-core';

import * as Schemas from './schemas';
import * as Repositories from './repositories';

export * from './schemas';
export * from './repositories';

function get<T>(fn: () => T) { return fn(); }

const appContainer = Containers.appContainerAs<{ postgres: Sequelize; }>();

export const repositories = {} as {
  users: Repositories.UserRepository;
  profiles: Repositories.UserProfileRepository;
  passwords: Repositories.UserPasswordRepository;
  loginAttempts: Repositories.LoginAttemptRepository;
};

export const createRegisteredRepositories = (
  userSchema = get(Schemas.getUserSchema),
  profileSchema = get(Schemas.getProfileSchema),
  passwordSchema = get(Schemas.getPasswordSchema),
  loginAttemptSchema = get(Schemas.getLoginAttemptSchema),
) => {
  const postgres = appContainer.resolve('postgres');

  const userModel = postgres.define('User', userSchema.schema, userSchema.options);
  const profileModel = postgres.define('UserProfile', profileSchema.schema, profileSchema.options);
  const passwordModel = postgres.define('UserPassword', passwordSchema.schema, passwordSchema.options);
  const loginAttemptModel = postgres.define('LoginAttempt', loginAttemptSchema.schema, loginAttemptSchema.options);

  userModel.hasOne(profileModel, {
    as: 'profile',
    foreignKey: 'userId',
  });

  userModel.hasMany(passwordModel, {
    as: 'passwords',
    foreignKey: 'userId',
  });

  userModel.hasMany(loginAttemptModel, {
    as: 'loginAttempts',
    foreignKey: 'userId',
  });

  profileModel.belongsTo(userModel, {
    as: 'user',
    foreignKey: 'userId',
  });

  passwordModel.belongsTo(userModel, {
    as: 'user',
    foreignKey: 'userId',
  });

  loginAttemptModel.belongsTo(userModel, {
    as: 'user',
    foreignKey: 'userId',
  });

  repositories.users = new Repositories.UserRepository(userModel);
  repositories.profiles = new Repositories.UserProfileRepository(profileModel);
  repositories.passwords = new Repositories.UserPasswordRepository(passwordModel);
  repositories.loginAttempts = new Repositories.LoginAttemptRepository(loginAttemptModel);

  registerRepositories({
    userRepository: repositories.users,
    userProfileRepository: repositories.profiles,
    userPasswordRepository: repositories.passwords,
    loginAttemptRepository: repositories.loginAttempts,
  });
};
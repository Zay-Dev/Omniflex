import { Sequelize } from 'sequelize';
import { Containers } from '@omniflex/core';
import { registerRepositories } from '@omniflex/module-identity-core';

import * as Schemas from './schemas';
import * as Repositories from './repositories';

export * from './schemas';
export * from './repositories';

type TContainer = { sequelize: Sequelize; };

function get<T>(fn: () => T) { return fn(); }

export const appContainer = Containers.appContainerAs<TContainer>();

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
  const sequelize = appContainer.resolve('sequelize');
  const define = (modelName: string, { schema, options }) => {
    return sequelize.define(modelName, schema, options);
  };

  const userModel = define('User', userSchema);
  const profileModel = define('UserProfile', profileSchema);
  const passwordModel = define('UserPassword', passwordSchema);
  const loginAttemptModel = define('LoginAttempt', loginAttemptSchema);

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
import { Sequelize } from 'sequelize';
import { Containers } from '@omniflex/core';
import { registerRepositories } from '@omniflex/module-identity-core';

import * as Schemas from './schemas';

export * from './schemas';

function get<T>(fn: () => T) { return fn(); }

const appContainer = Containers.appContainerAs<{ sequelize: Sequelize; }>();

export const repositories = {} as {
  users: Schemas.User.UserRepository;
  profiles: Schemas.UserProfile.UserProfileRepository;
  passwords: Schemas.UserPassword.UserPasswordRepository;
  loginAttempts: Schemas.LoginAttempt.LoginAttemptRepository;
};

export const createRegisteredRepositories = (
  userSchema = get(Schemas.User.defineSchema),
  profileSchema = get(Schemas.UserProfile.defineSchema),
  passwordSchema = get(Schemas.UserPassword.defineSchema),
  loginAttemptSchema = get(Schemas.LoginAttempt.defineSchema),
) => {
  const sequelize = appContainer.resolve('sequelize');

  const userModel = sequelize.define('Users', userSchema.schema, userSchema.options);
  const profileModel = sequelize.define('UserProfiles', profileSchema.schema, profileSchema.options);
  const passwordModel = sequelize.define('UserPasswords', passwordSchema.schema, passwordSchema.options);
  const loginAttemptModel = sequelize.define('LoginAttempts', loginAttemptSchema.schema, loginAttemptSchema.options);

  repositories.users = new Schemas.User.UserRepository(userModel);
  repositories.profiles = new Schemas.UserProfile.UserProfileRepository(profileModel);
  repositories.passwords = new Schemas.UserPassword.UserPasswordRepository(passwordModel);
  repositories.loginAttempts = new Schemas.LoginAttempt.LoginAttemptRepository(loginAttemptModel);

  registerRepositories({
    userRepository: repositories.users,
    userProfileRepository: repositories.profiles,
    userPasswordRepository: repositories.passwords,
    loginAttemptRepository: repositories.loginAttempts,
  });
};
import { Connection } from 'mongoose';
import { Containers } from '@omniflex/core';
import { registerRepositories } from '@omniflex/module-identity-core';

import * as Schemas from './schemas';
import * as Repositories from './repositories';

export * from './schemas';
export * from './repositories';

function get<T>(fn: () => T) { return fn(); }

const appContainer = Containers.appContainerAs<{ mongoose: Connection; }>();

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
  const mongoose = appContainer.resolve('mongoose');

  const userModel = mongoose.model('Users', userSchema);
  const profileModel = mongoose.model('UserProfiles', profileSchema);
  const passwordModel = mongoose.model('UserPasswords', passwordSchema);
  const loginAttemptModel = mongoose.model('LoginAttempts', loginAttemptSchema);

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
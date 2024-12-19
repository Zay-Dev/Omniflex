import { Connection } from 'mongoose';
import { Containers } from '@omniflex/core';
import { registerRepositories } from '@omniflex/module-identity-core';

import * as Schemas from './schemas';

export * from './schemas';

function get<T>(fn: () => T) { return fn(); }

const appContainer = Containers.appContainerAs<{ mongoose: Connection; }>();

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
  const mongoose = appContainer.resolve('mongoose');

  const userModel = mongoose.model('Users', userSchema);
  const profileModel = mongoose.model('UserProfiles', profileSchema);
  const passwordModel = mongoose.model('UserPasswords', passwordSchema);
  const loginAttemptModel = mongoose.model('LoginAttempts', loginAttemptSchema);

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
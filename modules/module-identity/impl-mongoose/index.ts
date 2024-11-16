import { Connection } from 'mongoose';
import { Containers } from '@omniflex/core';
import { registerRepositories } from '@omniflex/module-identity-core';

import * as Schemas from './schemas';
import * as Repositories from './repositories';

export * from './schemas';
export * from './repositories';

function get<T>(fn: () => T) { return fn(); }

const appContainer = Containers.appContainerAs<{ mongoose: Connection; }>();

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

  registerRepositories({
    userRepository: new Repositories.UserRepository(userModel),
    userProfileRepository: new Repositories.UserProfileRepository(profileModel),
    userPasswordRepository: new Repositories.UserPasswordRepository(passwordModel),
    loginAttemptRepository: new Repositories.LoginAttemptRepository(loginAttemptModel),
  });
};
import { registerRepositories } from '@omniflex/module-identity-core';

import * as User from './schemas/user';
import * as UserProfile from './schemas/user-profile';
import * as UserPassword from './schemas/user-password';
import * as LoginAttempt from './schemas/login-attempt';

const models = {
  users: null as any,
  profiles: null as any,
  passwords: null as any,
  loginAttempts: null as any,
};

export const createRegisteredRepositories = (
  userSchema?: Parameters<typeof User.createRepository>[0],
  profileSchema?: Parameters<typeof UserProfile.createRepository>[0],
  passwordSchema?: Parameters<typeof UserPassword.createRepository>[0],
  loginAttemptSchema?: Parameters<typeof LoginAttempt.createRepository>[0],
) => {
  const users = User.createRepository(userSchema);
  const profiles = UserProfile.createRepository(profileSchema);
  const passwords = UserPassword.createRepository(passwordSchema);
  const loginAttempts = LoginAttempt.createRepository(loginAttemptSchema);

  registerRepositories({
    userRepository: users,
    userProfileRepository: profiles,
    userPasswordRepository: passwords,
    loginAttemptRepository: loginAttempts,
  });

  models.users = users.getModel();
  models.profiles = profiles.getModel();
  models.passwords = passwords.getModel();
  models.loginAttempts = loginAttempts.getModel();
};
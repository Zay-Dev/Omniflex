import { registerRepositories } from '@omniflex/module-identity-core';

import * as User from './schemas/user';
import * as UserProfile from './schemas/user-profile';
import * as UserPassword from './schemas/user-password';
import * as LoginAttempt from './schemas/login-attempt';

const models = {
  users: null as unknown as ReturnType<User.Users['getModel']>,
  profiles: null as unknown as ReturnType<UserProfile.UserProfiles['getModel']>,
  passwords: null as unknown as ReturnType<UserPassword.UserPasswords['getModel']>,
  loginAttempts: null as unknown as ReturnType<LoginAttempt.LoginAttempts['getModel']>,
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

  models.users.hasOne(models.profiles, {
    as: 'profile',
    foreignKey: 'userId',
  });

  models.users.hasMany(models.passwords, {
    as: 'passwords',
    foreignKey: 'userId',
  });

  models.users.hasMany(models.loginAttempts, {
    as: 'loginAttempts',
    foreignKey: 'userId',
  });

  models.profiles.belongsTo(models.users, {
    as: 'user',
    foreignKey: 'userId',
  });

  models.passwords.belongsTo(models.users, {
    as: 'user',
    foreignKey: 'userId',
  });

  models.loginAttempts.belongsTo(models.users, {
    as: 'user',
    foreignKey: 'userId',
  });
};
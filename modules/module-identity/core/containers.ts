import * as Awilix from 'awilix';

import {
  TUser,
  IUserRepository,
  IUserProfileRepository,
  IUserPasswordRepository,
  ILoginAttemptRepository,
} from './types';

type TIdentityContainer = {
  userRepository: IUserRepository;
  userProfileRepository: IUserProfileRepository;
  userPasswordRepository: IUserPasswordRepository;
  loginAttemptRepository: ILoginAttemptRepository;
};

export const container = Awilix.createContainer<TIdentityContainer>();

export const registerRepositories = (repositories: Partial<TIdentityContainer>) => {
  for (const [key, value] of Object.entries(repositories)) {
    container.register({
      [key]: Awilix.asValue(value)
    });
  }
};

export const resolve = <T extends TUser = TUser>() => {
  const users = container.resolve<IUserRepository<T>>('userRepository');

  return {
    users,
    profiles: container.resolve('userProfileRepository'),
    passwords: container.resolve('userPasswordRepository'),
    loginAttempts: container.resolve('loginAttemptRepository'),
  };
};
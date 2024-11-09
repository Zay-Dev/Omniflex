import { Awilix } from '@omniflex/core/containers';
import { IHashProvider } from '@omniflex/core/types/hash';

import {
  IUserRepository,
  IUserProfileRepository,
  IUserPasswordRepository,
  ILoginAttemptRepository,
} from './types';

type TIdentityContainer = {
  hashProvider: IHashProvider;
  userRepository: IUserRepository;
  userProfileRepository: IUserProfileRepository;
  userPasswordRepository: IUserPasswordRepository;
  loginAttemptRepository: ILoginAttemptRepository;
};

export const container = Awilix.createContainer<TIdentityContainer>();

export const resolve = () => ({
  hashProvider: container.resolve('hashProvider'),
  repositories: {
    users: container.resolve('userRepository'),
    profiles: container.resolve('userProfileRepository'),
    passwords: container.resolve('userPasswordRepository'),
    loginAttempts: container.resolve('loginAttemptRepository')
  }
});

export const registerRepositories = (repositories: Partial<TIdentityContainer>) => {
  for (const [key, value] of Object.entries(repositories)) {
    container.register({
      [key]: Awilix.asValue(value)
    });
  }
};

export const registerHashProvider = (provider: IHashProvider) => {
  container.register({
    hashProvider: Awilix.asValue(provider)
  });
};
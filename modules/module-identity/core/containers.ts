import { Awilix } from '@omniflex/core/containers';

import {
  IUserRepository,
  IUserProfileRepository,
  IUserPasswordRepository,
  ILoginAttemptRepository,
} from './types';

type TIdentityContainer = {
  userRepository: IUserRepository<string>;
  userProfileRepository: IUserProfileRepository<string>;
  userPasswordRepository: IUserPasswordRepository<string>;
  loginAttemptRepository: ILoginAttemptRepository<string>;
};

export const container = Awilix.createContainer<TIdentityContainer>();

export const registerRepositories = (repositories: Partial<TIdentityContainer>) => {
  for (const [key, value] of Object.entries(repositories)) {
    container.register({
      [key]: Awilix.asValue(value)
    });
  }
};
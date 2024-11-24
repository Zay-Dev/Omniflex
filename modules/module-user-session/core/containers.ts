import * as Awilix from 'awilix';
import { IUserSessionRepository } from './types';

type TUserSessionContainer = {
  userSessionRepository: IUserSessionRepository;
};

export const container = Awilix.createContainer<TUserSessionContainer>();

export const registerRepositories = (repositories: Partial<TUserSessionContainer>) => {
  for (const [key, value] of Object.entries(repositories)) {
    container.register({
      [key]: Awilix.asValue(value)
    });
  }
};

export const resolve = () => {
  return {
    sessions: container.resolve('userSessionRepository'),
  };
};
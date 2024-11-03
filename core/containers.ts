import { createContainer } from 'awilix';
import { ILogger } from './types/logger';

type TContainer = {
  logger: ILogger;
};

export * as Awilix from 'awilix';

export const appContainer = createContainer<TContainer>();
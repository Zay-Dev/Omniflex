import { createContainer } from 'awilix';
import { ILogger } from './types/logger';
import { IErrorFactory } from './types/error';

type TContainer = {
  logger: ILogger;
  errorFactory: IErrorFactory;
};

export * as Awilix from 'awilix';

export const appContainer = createContainer<TContainer>();
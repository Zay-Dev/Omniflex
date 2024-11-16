import { TBaseConfig } from './types/config';
import { IErrorFactory } from './types/error';

import { ILogger } from './types/logger';
import { IHashProvider } from './types/hash';

import {
  asValue,
  AwilixContainer,
  createContainer,
} from 'awilix';

type TContainer = {
  logger: ILogger;
  config: TBaseConfig;
  errorFactory: IErrorFactory;

  hashProvider: IHashProvider;
} & Record<string, any>;

export * as Awilix from 'awilix';

export const appContainer = createContainer<TContainer>();

export const asValues = (services: Partial<TContainer>) => {
  for (const [key, value] of Object.entries(services)) {
    appContainer.register({
      [key]: asValue(value),
    });
  }
};

export const configAs = <T extends TBaseConfig = TBaseConfig>() => {
  return appContainer.resolve<T>('config');
};

export const appContainerAs = <T>() => {
  return appContainer as AwilixContainer<TContainer & T>;
};
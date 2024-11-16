import { TBaseConfig } from './types/config';
import { IErrorFactory } from './types/error';

import { ILogger } from './types/logger';
import { IHashProvider } from './types/hash';

import * as Awilix from 'awilix';
import { AwilixContainer, createContainer } from 'awilix';

type TContainer = {
  logger: ILogger;
  config: TBaseConfig;
  errorFactory: IErrorFactory;

  hashProvider: IHashProvider;
} & Record<string, any>;

export const appContainer = createContainer<TContainer>();

export const asValue = (
  key: string,
  value: any,
  { override }: { override?: boolean; } = {},
) => {
  if (!override) {
    if (appContainer.hasRegistration(key)) {
      return appContainer;
    }
  }

  return appContainer.register({
    [key]: Awilix.asValue(value),
  });
};

export const asValues = (services: Partial<TContainer>) => {
  for (const [key, value] of Object.entries(services)) {
    appContainer.register({
      [key]: Awilix.asValue(value),
    });
  }

  return appContainer;
};

export const configAs = <T extends TBaseConfig = TBaseConfig>() => {
  return appContainer.resolve<T>('config');
};

export const appContainerAs = <T>() => {
  return appContainer as AwilixContainer<TContainer & T>;
};
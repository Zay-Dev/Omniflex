import { TBaseConfig } from './types/config';
import { appContainer, Awilix } from './containers';

export const configAs = <T extends TBaseConfig = TBaseConfig>() => {
  return appContainer.resolve<T>('config');
};

export const registerConfig = (config: TBaseConfig) => {
  appContainer.register({
    config: Awilix.asValue(config),
  });
};
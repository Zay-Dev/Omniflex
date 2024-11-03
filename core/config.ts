import { TBaseConfig } from './types/config';
import { appContainer, Awilix } from './containers';

export const configAs = <T extends TBaseConfig>() => {
  return appContainer.resolve<T>('config');
};

export const bindConfig = (config: TBaseConfig) => {
  if (!appContainer.hasRegistration('config')) {
    appContainer.register({
      config: Awilix.asValue(config),
    });
  }
};
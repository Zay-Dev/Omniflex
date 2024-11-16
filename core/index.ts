import * as Types from './types';
import * as Containers from './containers';
import { errorFactory } from './impl/error-factory';

const { appContainer } = Containers;

Containers.asValue('errorFactory', errorFactory);

export * as Containers from './containers';

export const providers = {
  hash: null as any as Types.IHashProvider,
};

export let logger = null as any as Types.ILogger;
export let errors = appContainer.resolve('errorFactory');

export const handleUncaughtException = () => {
  process.on('uncaughtException', error => {
    console.error(`\
Uncaught Exception (${error?.message || 'N/a'}):
${error}
`);
  });
};

export const initializeAppContainer = (values: {
  logger?: Types.ILogger;
  errors?: Types.IErrorFactory;
  hashProvider?: Types.IHashProvider;
}) => {
  if (values.errors) {
    errors = values.errors;
    Containers.asValue('errorFactory', values.errors);
  }

  if (values.logger) {
    logger = values.logger;
    Containers.asValue('logger', values.logger);
  }

  if (values.hashProvider) {
    providers.hash = values.hashProvider;
    Containers.asValue('hashProvider', values.hashProvider);
  }
};
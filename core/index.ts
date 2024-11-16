import * as Containers from './containers';
import { errorFactory } from './error-factory';

const { appContainer } = Containers;

Containers.asValue('errorFactory', errorFactory);

export * as Containers from './containers';

export const logger = appContainer.resolve('logger');
export const errors = appContainer.resolve('errorFactory');

export const providers = {
  hash: appContainer.resolve('hashProvider'),
};

export const handleUncaughtException = () => {
  process.on('uncaughtException', error => {
    console.error(`\
Uncaught Exception (${error?.message || 'N/a'}):
${error}
`);
  });
};
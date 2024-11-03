import { appContainer } from './containers';
import { errorFactory } from './error-factory';
import { Awilix } from './containers';

if (!appContainer.hasRegistration('errorFactory')) {
  appContainer.register({
    errorFactory: Awilix.asValue(errorFactory)
  });
}

export const logger = appContainer.resolve('logger');
export const errors = appContainer.resolve('errorFactory');

export const handleUncaughtException = () => {
  process.on('uncaughtException', error => {
    console.error(`\
Uncaught Exception (${error?.message || 'N/a'}):
${error}
`);
  });
};
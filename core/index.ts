import * as Types from './types';
import * as Containers from './containers';

import { errorFactory } from './impl/error-factory';
import { createLogger } from './impl/console-logger';

const { appContainer } = Containers;

Containers.asValue('errorFactory', errorFactory);

export const modulesSchemas = {} as any;

export * as Containers from './containers';

export const providers = {
  hash: null as any as Types.IHashProvider,
};

export let logger = createLogger() as any as Types.ILogger;
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

export const autoImport = async (
  absolutePath: string,
  shouldImport: (filename: string) => boolean,
  depth: number = 99,
) => {
  const fs = await import('fs/promises');
  const { pathToFileURL } = await import('url');

  const children = await fs.readdir(absolutePath, { withFileTypes: true });

  const files = children.filter(child => child.isFile());
  const directories = children.filter(child => child.isDirectory());

  await Promise.all(
    files
      .filter(file => {
        return shouldImport(
          file.name
            .split('.')
            .slice(0, -1)
            .join('.')
        );
      })
      .map(file => pathToFileURL(`${file.parentPath}/${file.name}`))
      .map(file => import(`${file}`)),
  );

  if (depth >= 0) {
    await Promise.all(
      directories
        .map(dir => autoImport(`${dir.parentPath}/${dir.name}`, shouldImport, depth - 1))
    );
  }
};
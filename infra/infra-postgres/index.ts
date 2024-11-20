import { Sequelize } from 'sequelize';
import { logger, Containers } from '@omniflex/core';

import { TPostgresConfig } from './types';

export * from './repositories';
export { type TModel } from './repositories/base';

export const getConnection = async (
  { postgres } = Containers.configAs<TPostgresConfig>()
) => {
  const connection = new Sequelize(
    postgres.uri,
    {
      logging: (msg) => logger.debug(msg, {
        tags: ['postgres'],
      }),
    },
  );

  await connection.authenticate();
  return connection;
};
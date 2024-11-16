import { Containers } from '@omniflex/core';

import { TMongooseConfig } from './types';
import { createConnection } from 'mongoose';

export * from './repositories';

export const getConnection = (
  { mongoose }: TMongooseConfig = Containers.configAs<TMongooseConfig>()
) => {
  const connection = createConnection(
    mongoose.uri,
    {
      dbName: mongoose.dbName || undefined,
    }
  );

  return connection.asPromise();
};
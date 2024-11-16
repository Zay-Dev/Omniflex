import { TMongooseConfig } from './types';
import { createConnection } from 'mongoose';
import { configAs } from '@omniflex/core/containers';

export * from './repositories';

export const getConnection = (
  { mongoose }: TMongooseConfig = configAs<TMongooseConfig>()
) => {
  const connection = createConnection(
    mongoose.uri,
    {
      dbName: mongoose.dbName || undefined,
    }
  );

  return connection.asPromise();
};
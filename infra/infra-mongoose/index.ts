import mongooseLeanDefaults from 'mongoose-lean-defaults';
import { mongooseLeanGetters } from 'mongoose-lean-getters';
import { mongooseLeanVirtuals } from 'mongoose-lean-virtuals';

import { Containers } from '@omniflex/core';

import { TMongooseConfig } from './types';
import { createConnection } from 'mongoose';

export * from './repositories';

export const getConnection = (
  { mongoose } = Containers.configAs<TMongooseConfig>()
) => {
  const connection = createConnection(
    mongoose.uri,
    {
      dbName: mongoose.dbName || undefined,
    }
  );
  connection.plugin(mongooseLeanGetters);
  connection.plugin(mongooseLeanVirtuals);
  connection.plugin((mongooseLeanDefaults as any).default);

  return connection.asPromise();
};
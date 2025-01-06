import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, Model, Schema } from 'mongoose';
import mongooseLeanDefaults from 'mongoose-lean-defaults';
import { mongooseLeanGetters } from 'mongoose-lean-getters';
import { mongooseLeanVirtuals } from 'mongoose-lean-virtuals';
import { paranoidPlugin } from '../plugins/paranoid';

let mongod: MongoMemoryServer;
let connection: Connection;

export const startMemoryServer = async (): Promise<Connection> => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  connection = await mongoose.createConnection(uri).asPromise();

  // Add plugins
  connection.plugin(mongooseLeanGetters);
  connection.plugin(mongooseLeanVirtuals);
  connection.plugin((mongooseLeanDefaults as any).default || mongooseLeanDefaults);
  connection.plugin(paranoidPlugin);

  return connection;
};

export const stopMemoryServer = async (): Promise<void> => {
  if (connection) {
    await connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
};

export const clearDatabase = async (): Promise<void> => {
  if (!connection) {
    throw new Error('Connection not established');
  }
  const collections = await (connection.db!).collections();
  await Promise.all(collections.map(collection => collection.deleteMany({})));
};

export const getConnection = (): Connection => {
  if (!connection) {
    throw new Error('Connection not established');
  }
  return connection;
};

export const createModel = <T>(name: string, schema: Schema): Model<T> => {
  if (!connection) {
    throw new Error('Connection not established');
  }
  return connection.model<T>(name, schema);
};

export const createObjectId = () => new mongoose.Types.ObjectId();
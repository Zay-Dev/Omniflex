import { Connection, connect } from 'mongoose';

export const createTestMongoose = async () => {
  const mongoose = await connect('mongodb://localhost:27017/test');
  return mongoose.connection;
};

export const setupTestDatabase = async (mongoose: Connection) => {
  await mongoose.dropDatabase();
};

export const clearDatabase = async (mongoose: Connection) => {
  if (!mongoose.db) {
    throw new Error('Database not connected');
  }
  const collections = await mongoose.db.collections();
  await Promise.all(collections.map(collection => collection.deleteMany({})));
};

export const closeDatabase = async (mongoose: Connection) => {
  await mongoose.close();
};
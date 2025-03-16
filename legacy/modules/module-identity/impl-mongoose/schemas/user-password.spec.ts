import { Schema, Connection } from 'mongoose';
import { Containers } from '@omniflex/core';
import { TUserPassword } from '@omniflex/module-identity-core/types';
import { AwilixContainer } from 'awilix';

import { baseDefinition, defineSchema, createRepository, UserPasswords } from './user-password';

// Define the type for our container
type TTestContainer = {
  mongoose: {
    model: jest.Mock;
  };
};

// Mock @omniflex/core at module level
jest.mock('@omniflex/core', () => {
  const mockModel = {
    schema: {
      alias: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
    },
    recompileSchema: jest.fn(),
  };

  const mockMongoose = {
    model: jest.fn().mockReturnValue(mockModel)
  };

  const mockContainer = {
    cradle: {
      mongoose: mockMongoose
    },
    resolve: jest.fn((key: string) => mockContainer.cradle[key]),
  } as unknown as AwilixContainer<TTestContainer>;

  return {
    Containers: {
      appContainerAs: jest.fn().mockReturnValue(mockContainer)
    }
  };
});

type VirtualType = {
  options: {
    ref: string;
    justOne: boolean;
    foreignField: string;
    localField: string;
  };
};

type SchemaType = Schema & {
  virtuals: {
    user: VirtualType;
  };
};

describe('UserPassword Schema', () => {
  describe('Schema Definition', () => {
    it('[REPO-C0010] should define schema with required fields', () => {
      const schema = defineSchema();
      const paths = schema.paths;

      // Required fields
      expect(paths.salt).toBeDefined();
      expect(paths.username).toBeDefined();
      expect(paths.hashedPassword).toBeDefined();
      expect(paths.userId).toBeDefined();
      expect(paths.deletedAt).toBeDefined();

      // Required validations
      expect(paths.salt.isRequired).toBeTruthy();
      expect(paths.username.isRequired).toBeTruthy();
      expect(paths.hashedPassword.isRequired).toBeTruthy();
      expect(paths.userId.isRequired).toBeTruthy();
    });

    it('[REPO-C0020] should define virtual fields', () => {
      const schema = defineSchema() as SchemaType;
      const virtuals = schema.virtuals;

      expect(virtuals.user).toBeDefined();
      expect(virtuals.user.options.ref).toBe('Users');
      expect(virtuals.user.options.justOne).toBeTruthy();
      expect(virtuals.user.options.foreignField).toBe('_id');
      expect(virtuals.user.options.localField).toBe('userId');
    });

    it('[REPO-C0030] should define indexes', () => {
      const schema = defineSchema();
      const indexes = schema.indexes();

      // Test behavior: username should be unique for non-deleted records
      const usernameIndex = indexes.find(([fields]) => fields.username === 1);
      if (!usernameIndex) {
        throw new Error('Username index not found');
      }

      expect(usernameIndex[1]).toEqual(expect.objectContaining({
        unique: true,
        partialFilterExpression: expect.objectContaining({
          deletedAt: null
        })
      }));
    });

    it('[REPO-C0040] should allow custom schema definition', () => {
      const customDefinition = {
        ...baseDefinition,
        customField: { type: String },
      };

      const schema = defineSchema(customDefinition);
      expect(schema.paths.customField).toBeDefined();
    });
  });

  describe('Repository Creation', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('[REPO-C0050] should create repository with default schema', () => {
      const repository = createRepository();
      expect(repository).toBeInstanceOf(UserPasswords);
      const container = Containers.appContainerAs<TTestContainer>();
      expect(container.cradle.mongoose.model)
        .toHaveBeenCalledWith('UserPasswords', expect.any(Schema));
    });

    it('[REPO-C0060] should create repository with custom schema', () => {
      const customSchema = new Schema({
        ...baseDefinition,
        customField: { type: String },
      });

      const repository = createRepository(customSchema);
      expect(repository).toBeInstanceOf(UserPasswords);
      const container = Containers.appContainerAs<TTestContainer>();
      expect(container.cradle.mongoose.model)
        .toHaveBeenCalledWith('UserPasswords', customSchema);
    });

    it('[REPO-C0070] should create repository with custom definition', () => {
      const customDefinition = {
        ...baseDefinition,
        customField: { type: String },
      };

      const repository = createRepository(customDefinition);
      expect(repository).toBeInstanceOf(UserPasswords);
      const container = Containers.appContainerAs<TTestContainer>();
      expect(container.cradle.mongoose.model)
        .toHaveBeenCalledWith('UserPasswords', expect.any(Schema));
    });
  });
}); 
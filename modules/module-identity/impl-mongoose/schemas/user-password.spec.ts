import { Schema } from 'mongoose';
import { Containers } from '@omniflex/core';
import { TUserPassword } from '@omniflex/module-identity-core/types';

import { baseDefinition, defineSchema, createRepository, UserPasswords } from './user-password';

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

jest.mock('@omniflex/core', () => ({
  Containers: {
    appContainerAs: jest.fn().mockReturnValue({
      resolve: jest.fn().mockReturnValue({
        model: jest.fn().mockReturnValue({}),
      }),
    }),
  },
}));

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

      expect(indexes).toContainEqual([
        { username: 1 },
        {
          unique: true,
          partialFilterExpression: { deletedAt: null },
        },
      ]);
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
    it('[REPO-C0050] should create repository with default schema', () => {
      const repository = createRepository();
      expect(repository).toBeInstanceOf(UserPasswords);
    });

    it('[REPO-C0060] should create repository with custom schema', () => {
      const customSchema = new Schema({
        ...baseDefinition,
        customField: { type: String },
      });

      const repository = createRepository(customSchema);
      expect(repository).toBeInstanceOf(UserPasswords);
    });

    it('[REPO-C0070] should create repository with custom definition', () => {
      const customDefinition = {
        ...baseDefinition,
        customField: { type: String },
      };

      const repository = createRepository(customDefinition);
      expect(repository).toBeInstanceOf(UserPasswords);
    });
  });

  describe('Repository Methods', () => {
    let repository: UserPasswords;
    let mockModel: any;

    beforeEach(() => {
      mockModel = {
        findOne: jest.fn(),
      };

      const mongoose = {
        model: jest.fn().mockReturnValue(mockModel),
      };

      jest.spyOn(Containers.appContainerAs(), 'resolve')
        .mockReturnValue(mongoose);

      repository = createRepository();
    });

    it('[REPO-R0010] should find by username', async () => {
      const username = 'test-user';
      await repository.findByUsername(username);

      expect(mockModel.findOne).toHaveBeenCalledWith({
        username,
        deletedAt: null,
      });
    });
  });
}); 
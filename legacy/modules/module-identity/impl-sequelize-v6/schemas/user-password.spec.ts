import { Model, Sequelize } from 'sequelize';
import { Containers } from '@omniflex/core';
import { TUserPassword } from '@omniflex/module-identity-core/types';
import { AwilixContainer } from 'awilix';
import { TModel } from '@omniflex/infra-sequelize-v6';

import { baseDefinition, getDefinition, createRepository, UserPasswords } from './user-password';

// Mock @omniflex/core at module level
jest.mock('@omniflex/core', () => {
  // Create a pure mock model that will pass instanceof checks
  const mockModel = {
    modelName: 'UserPasswords',
    tableName: 'UserPasswords',
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    __proto__: Model.prototype
  };

  const mockSequelize = {
    define: jest.fn().mockReturnValue(mockModel),
  };

  const mockContainer = {
    cradle: {
      sequelize: mockSequelize
    },
    resolve: jest.fn((key: string) => mockContainer.cradle[key]),
  } as unknown as AwilixContainer<TTestContainer>;

  return {
    Containers: {
      appContainerAs: jest.fn().mockReturnValue(mockContainer)
    }
  };
});

// Define the type for our container
type TTestContainer = {
  sequelize: Sequelize;
};

describe('UserPassword Schema', () => {
  describe('Schema Definition', () => {
    it('[REPO-C0010] should define schema with required fields', () => {
      const { schema } = getDefinition();

      // Required fields
      expect(schema.salt).toBeDefined();
      expect(schema.username).toBeDefined();
      expect(schema.hashedPassword).toBeDefined();
      expect(schema.userId).toBeDefined();
      expect(schema.deletedAt).toBeDefined();

      // Required validations
      expect(schema.salt.allowNull).toBe(false);
      expect(schema.username.allowNull).toBe(false);
      expect(schema.hashedPassword.allowNull).toBe(false);
      expect(schema.userId.allowNull).toBe(false);
    });

    it('[REPO-C0020] should define foreign key relationship', () => {
      const { schema } = getDefinition();

      expect(schema.userId.references).toBeDefined();
      expect(schema.userId.references.model).toBe('Users');
      expect(schema.userId.references.key).toBe('id');
    });

    it('[REPO-C0030] should define indexes', () => {
      const { options } = getDefinition();
      const indexes = options.indexes || [];

      // Test behavior: username should be unique for non-deleted records
      const usernameIndex = indexes.find(index => 
        Array.isArray(index.fields) 
          ? index.fields.includes('username')
          : index.fields === 'username'
      );

      expect(usernameIndex).toBeDefined();
      expect(usernameIndex?.unique).toBe(true);
      expect(usernameIndex?.where).toEqual({ deletedAt: null });
    });

    it('[REPO-C0040] should allow custom schema definition', () => {
      const customDefinition = {
        ...baseDefinition,
        customField: { type: 'STRING' },
      };

      const { schema } = getDefinition(customDefinition);
      expect(schema.customField).toBeDefined();
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
      expect(container.cradle.sequelize.define)
        .toHaveBeenCalledWith('UserPasswords', expect.any(Object), expect.any(Object));
    });

    it('[REPO-C0060] should create repository with existing model', () => {
      const container = Containers.appContainerAs<TTestContainer>();
      const mockModel = container.cradle.sequelize.define('UserPasswords', {});
      
      const repository = createRepository(mockModel as TModel<Model<TUserPassword>>);
      expect(repository).toBeInstanceOf(UserPasswords);
    });

    it('[REPO-C0070] should create repository with custom definition', () => {
      const customDefinition = {
        ...baseDefinition,
        customField: { type: 'STRING' },
      };

      const repository = createRepository(getDefinition(customDefinition));
      expect(repository).toBeInstanceOf(UserPasswords);

      const container = Containers.appContainerAs<TTestContainer>();
      expect(container.cradle.sequelize.define)
        .toHaveBeenCalledWith('UserPasswords', expect.objectContaining({
          customField: expect.any(Object)
        }), expect.any(Object));
    });

    it('[REPO-C0080] should reuse existing repository instance', () => {
      const existingRepo = new UserPasswords({} as any);
      const repository = createRepository(existingRepo);
      expect(repository).toBe(existingRepo);
    });
  });

  describe('Repository Methods', () => {
    it('[REPO-C0090] should implement findByUsername method', async () => {
      const mockData = {
        id: '1',
        username: 'test',
        toJSON: () => ({ id: '1', username: 'test' })
      };

      const repository = new UserPasswords({
        findOne: jest.fn().mockResolvedValue(mockData)
      } as any);

      const result = await repository.findByUsername('test');
      expect(result).toBeDefined();
      expect(result?.username).toBe('test');
    });
  });
}); 
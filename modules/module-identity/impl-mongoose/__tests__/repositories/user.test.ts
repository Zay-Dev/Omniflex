import { Types, Connection } from 'mongoose';
import { Containers } from '@omniflex/core';
import { TUser } from '@omniflex/module-identity-core/types';
import { startMemoryServer, stopMemoryServer, clearDatabase } from '@omniflex/infra-mongoose/test-utils/mongoose.memory';

import { createRepository, Users } from '../../schemas/user';
import { createTestUser } from '@omniflex/module-identity-core/test-utils/factories';

const mongoId = () => new Types.ObjectId();

describe('User Repository Integration', () => {
  let mongoose: Connection;
  let repository: Users;

  beforeAll(async () => {
    mongoose = await startMemoryServer();
    Containers.asValues({ mongoose });
    repository = createRepository();
  });

  afterAll(async () => {
    await stopMemoryServer();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('findById', () => {
    it('[REPO-I0010] should find user by id', async () => {
      const user = createTestUser({
        id: mongoId() as any,
      });
      const created = await repository.create(user);

      const found = await repository.findById(created.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.identifier).toBe(user.identifier);
    });

    it('[REPO-I0020] should return null for non-existent id', async () => {
      const found = await repository.findById(mongoId().toString());
      expect(found).toBeNull();
    });

    it('[REPO-I0030] should not find soft deleted user', async () => {
      const user = createTestUser({
        id: mongoId() as any,
      });
      const created = await repository.create(user);
      await repository.softDeleteById(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe('findOne', () => {
    it('[REPO-I0040] should find user by identifier', async () => {
      const user = createTestUser({
        id: mongoId() as any,
      });
      await repository.create(user);

      const found = await repository.findOne({ identifier: user.identifier });
      expect(found).toBeDefined();
      expect(found?.identifier).toBe(user.identifier);
    });

    it('[REPO-I0050] should return null for non-existent identifier', async () => {
      const found = await repository.findOne({ identifier: 'non-existent' });
      expect(found).toBeNull();
    });

    it('[REPO-I0060] should not find soft deleted user', async () => {
      const user = createTestUser({
        id: mongoId() as any,
      });
      const created = await repository.create(user);
      await repository.softDeleteById(created.id);

      const found = await repository.findOne({ identifier: user.identifier });
      expect(found).toBeNull();
    });
  });

  describe('create', () => {
    it('[REPO-I0070] should create user', async () => {
      const user = createTestUser({
        id: mongoId() as any,
      });
      const created = await repository.create(user);

      expect(created).toBeDefined();
      expect(created.identifier).toBe(user.identifier);
      expect(created.isVerified).toBe(user.isVerified);
      expect(created.deletedAt).toBeNull();
    });

    it('[REPO-I0080] should not create duplicate identifier', async () => {
      const user = createTestUser({
        id: mongoId() as any,
      });
      await repository.create(user);

      const duplicate = createTestUser({
        id: mongoId() as any,
        identifier: user.identifier,
      });

      await expect(repository.create(duplicate)).rejects.toThrow();
    });
  });

  describe('softDelete', () => {
    it('[REPO-I0090] should soft delete user', async () => {
      const user = createTestUser({
        id: mongoId() as any,
      });
      const created = await repository.create(user);
      await repository.softDeleteById(created.id);

      const found = await repository.findById(created.id);
      expect(found?.deletedAt).toBeDefined();
    });

    it('[REPO-I0100] should allow reusing identifier after soft delete', async () => {
      const user = createTestUser({
        id: mongoId() as any,
      });
      const created = await repository.create(user);
      await repository.softDeleteById(created.id);

      const newUser = createTestUser({
        id: mongoId() as any,
        identifier: user.identifier,
      });

      const result = await repository.create(newUser);
      expect(result).toBeDefined();
      expect(result.identifier).toBe(user.identifier);
    });
  });
}); 
import { Types, Connection } from 'mongoose';
import { Containers } from '@omniflex/core';
import { TUserPassword } from '@omniflex/module-identity-core/types';
import { startMemoryServer, stopMemoryServer, clearDatabase } from '@omniflex/infra-mongoose/test-utils/mongoose.memory';

import { createRepository, UserPasswords } from '../../schemas/user-password';
import { createTestUserPassword } from '@omniflex/module-identity-core/test-utils/factories';

const mongoId = () => new Types.ObjectId();

describe('UserPassword Repository Integration', () => {
  let mongoose: Connection;
  let repository: UserPasswords;

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

  describe('findByUsername', () => {
    it('[REPO-I0010] should find password by username', async () => {
      const password = createTestUserPassword({
        id: mongoId() as any,
      });
      await repository.create(password);

      const found = await repository.findByUsername(password.username);
      expect(found).toBeDefined();
      expect(found?.username).toBe(password.username);
      expect(found?.hashedPassword).toBe(password.hashedPassword);
      expect(found?.salt).toBe(password.salt);
    });

    it('[REPO-I0020] should return null for non-existent username', async () => {
      const found = await repository.findByUsername('non-existent');
      expect(found).toBeNull();
    });

    it('[REPO-I0030] should not find soft deleted password', async () => {
      const password = createTestUserPassword({
        id: mongoId() as any,
      });
      const created = await repository.create(password);
      await repository.softDeleteById(created.id);

      const found = await repository.findByUsername(password.username);
      expect(found).toBeNull();
    });
  });

  describe('create', () => {
    it('[REPO-I0040] should create password', async () => {
      const password = createTestUserPassword({
        id: mongoId() as any,
      });
      const created = await repository.create(password);

      expect(created).toBeDefined();
      expect(created.username).toBe(password.username);
      expect(created.hashedPassword).toBe(password.hashedPassword);
      expect(created.salt).toBe(password.salt);
      expect(created.deletedAt).toBeNull();
    });

    it('[REPO-I0050] should not create duplicate username', async () => {
      const password = createTestUserPassword({
        id: mongoId() as any,
      });
      await repository.create(password);

      const duplicate = createTestUserPassword({
        id: mongoId() as any,
        username: password.username,
      });

      await expect(repository.create(duplicate)).rejects.toThrow();
    });
  });

  describe('softDelete', () => {
    it('[REPO-I0060] should soft delete password', async () => {
      const password = createTestUserPassword({
        id: mongoId() as any,
      });
      const created = await repository.create(password);
      await repository.softDeleteById(created.id);

      const found = await repository.findById(created.id);
      expect(found?.deletedAt).toBeDefined();
    });

    it('[REPO-I0070] should allow reusing username after soft delete', async () => {
      const password = createTestUserPassword({
        id: mongoId() as any,
      });
      const created = await repository.create(password);
      await repository.softDeleteById(created.id);

      const newPassword = createTestUserPassword({
        id: mongoId() as any,
        username: password.username,
      });

      const result = await repository.create(newPassword);
      expect(result).toBeDefined();
      expect(result.username).toBe(password.username);
    });
  });
}); 
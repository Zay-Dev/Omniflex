import { Types, Connection } from 'mongoose';
import { Containers } from '@omniflex/core';
import { startMemoryServer, stopMemoryServer, clearDatabase } from '@omniflex/infra-mongoose/test-utils/mongoose.memory';

import { createRepository, LoginAttempts } from '../../schemas/login-attempt';
import { createTestLoginAttempt } from '@omniflex/module-identity-core/test-utils/factories';

const mongoId = () => new Types.ObjectId();

describe('LoginAttempt Repository Integration', () => {
  let mongoose: Connection;
  let repository: LoginAttempts;

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

  describe('findByIdentifier', () => {
    it('[REPO-I0010] should find attempts by identifier', async () => {
      const attempt = createTestLoginAttempt({
        id: mongoId() as any,
      });
      await repository.create(attempt);

      const found = await repository.find({ identifier: attempt.identifier });
      expect(found).toBeDefined();
      expect(found[0]?.identifier).toBe(attempt.identifier);
      expect(found[0]?.loginType).toBe(attempt.loginType);
      expect(found[0]?.success).toBe(attempt.success);
    });

    it('[REPO-I0020] should return empty array for non-existent identifier', async () => {
      const found = await repository.find({ identifier: 'non-existent' });
      expect(found).toEqual([]);
    });

    it('[REPO-I0030] should not find soft deleted attempts', async () => {
      const attempt = createTestLoginAttempt({
        id: mongoId() as any,
      });
      const created = await repository.create(attempt);
      await repository.softDeleteById(created.id);

      const found = await repository.find({ identifier: attempt.identifier });
      expect(found).toEqual([]);
    });
  });

  describe('create', () => {
    it('[REPO-I0040] should create login attempt', async () => {
      const attempt = createTestLoginAttempt({
        id: mongoId() as any,
      });
      const created = await repository.create(attempt);

      expect(created).toBeDefined();
      expect(created.identifier).toBe(attempt.identifier);
      expect(created.loginType).toBe(attempt.loginType);
      expect(created.success).toBe(attempt.success);
      expect(created.deletedAt).toBeNull();
    });

    it('[REPO-I0050] should create multiple attempts for same identifier', async () => {
      const attempt = createTestLoginAttempt({
        id: mongoId() as any,
      });
      await repository.create(attempt);

      const another = createTestLoginAttempt({
        id: mongoId() as any,
        identifier: attempt.identifier,
      });

      const result = await repository.create(another);
      expect(result).toBeDefined();
      expect(result.identifier).toBe(attempt.identifier);

      const found = await repository.find({ identifier: attempt.identifier });
      expect(found).toHaveLength(2);
    });
  });

  describe('softDelete', () => {
    it('[REPO-I0060] should soft delete attempt', async () => {
      const attempt = createTestLoginAttempt({
        id: mongoId() as any,
      });
      const created = await repository.create(attempt);
      await repository.softDeleteById(created.id);

      const found = await repository.findById(created.id);
      expect(found?.deletedAt).toBeDefined();
    });
  });
}); 
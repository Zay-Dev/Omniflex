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
        userId: mongoId() as any,
      });
      await repository.create(attempt);

      const found = await repository.find({ identifier: attempt.identifier });
      expect(found).toBeDefined();
      expect(found[0]).toMatchObject({
        identifier: attempt.identifier,
        loginType: attempt.loginType,
        success: attempt.success,
        userId: attempt.userId,
      });
    });

    it('[REPO-I0020] should return empty array for non-existent identifier', async () => {
      const found = await repository.find({ identifier: 'non-existent' });
      expect(found).toEqual([]);
    });

    it('[REPO-I0030] should not find soft deleted attempts', async () => {
      const attempt = createTestLoginAttempt({
        id: mongoId() as any,
        userId: mongoId() as any,
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
        userId: mongoId() as any,
      });
      const created = await repository.create(attempt);

      expect(created).toBeDefined();
      expect(created).toMatchObject({
        identifier: attempt.identifier,
        loginType: attempt.loginType,
        success: attempt.success,
        userId: attempt.userId,
        deletedAt: null,
      });
    });

    it('[REPO-I0050] should create multiple attempts for same identifier', async () => {
      const attempt = createTestLoginAttempt({
        id: mongoId() as any,
        userId: mongoId() as any,
      });
      await repository.create(attempt);

      const another = createTestLoginAttempt({
        id: mongoId() as any,
        userId: mongoId() as any,
        identifier: attempt.identifier,
      });

      const result = await repository.create(another);
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        identifier: attempt.identifier,
        userId: another.userId,
      });

      const found = await repository.find({ identifier: attempt.identifier });
      expect(found).toHaveLength(2);
    });
  });

  describe('softDelete', () => {
    it('[REPO-I0060] should soft delete attempt', async () => {
      const attempt = createTestLoginAttempt({
        id: mongoId() as any,
        userId: mongoId() as any,
      });
      const created = await repository.create(attempt);
      await repository.softDeleteById(created.id);

      const found = await repository.findById(created.id, { paranoid: false });
      expect(found).toBeDefined();
      expect(found?.deletedAt).toBeDefined();
    });
  });
}); 
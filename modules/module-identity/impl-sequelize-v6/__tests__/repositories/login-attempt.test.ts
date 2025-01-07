import { Sequelize } from 'sequelize';
import { Containers } from '@omniflex/core';
import { createTestSequelize, setupTestDatabase, closeDatabase } from '@omniflex/infra-sequelize-v6/test-utils/sequelize.test-utils';
import { createTestLoginAttempt } from '../../test-utils/factories';
import { clearModuleDatabase } from '../../test-utils/database';
import { createRepository as createLoginAttemptRepository } from '../../schemas/login-attempt';
import { createRepository as createUserRepository } from '../../schemas/user';

describe('LoginAttemptRepository', () => {
  let sequelize: Sequelize;
  let repository: ReturnType<typeof createLoginAttemptRepository>;

  beforeAll(async () => {
    sequelize = createTestSequelize();
    Containers.asValues({ sequelize });

    // Create both repositories to register models
    createUserRepository();
    repository = createLoginAttemptRepository();

    await setupTestDatabase(sequelize);
  });

  beforeEach(async () => {
    await clearModuleDatabase(sequelize);
  });

  afterAll(async () => {
    await closeDatabase(sequelize);
  });

  describe('base operations', () => {
    it('[REPO-C0010] should create login attempt', async () => {
      const data = createTestLoginAttempt();
      const result = await repository.create(data);
      expect(result).toBeTruthy();
      expect(result.id).toBe(data.id);
    });

    it('[REPO-R0010] should find login attempt by id', async () => {
      const data = createTestLoginAttempt();
      await repository.create(data);
      const result = await repository.findById(data.id);
      expect(result).toBeTruthy();
      expect(result?.id).toBe(data.id);
    });

    it('[REPO-R0020] should find login attempt by filter', async () => {
      const data = createTestLoginAttempt({ identifier: 'specific@example.com' });
      await repository.create(data);
      const result = await repository.findOne({ identifier: 'specific@example.com' });
      expect(result).toBeTruthy();
      expect(result?.id).toBe(data.id);
    });

    it('[REPO-U0010] should update login attempt by id', async () => {
      const data = createTestLoginAttempt();
      await repository.create(data);
      const result = await repository.updateById(data.id, { success: false });
      expect(result).toBeTruthy();
      expect(result?.success).toBe(false);
    });

    it('[REPO-D0010] should delete login attempt by id', async () => {
      const data = createTestLoginAttempt();
      await repository.create(data);
      const deleted = await repository.deleteById(data.id);
      expect(deleted).toBe(true);
      const result = await repository.findById(data.id);
      expect(result).toBeFalsy();
    });
  });

  describe('query options', () => {
    it('[REPO-Q0010] should handle pagination', async () => {
      await Promise.all([
        repository.create(createTestLoginAttempt()),
        repository.create(createTestLoginAttempt()),
        repository.create(createTestLoginAttempt()),
      ]);

      const results = await repository.find({}, { skip: 1, take: 1 });
      expect(results).toHaveLength(1);
    });

    it('[REPO-Q0020] should handle sorting', async () => {
      const first = await repository.create(createTestLoginAttempt({ identifier: 'a@example.com' }));
      const second = await repository.create(createTestLoginAttempt({ identifier: 'b@example.com' }));

      const ascending = await repository.find({}, { sort: { identifier: 'asc' } });
      expect(ascending[0].id).toBe(first.id);

      const descending = await repository.find({}, { sort: { identifier: 'desc' } });
      expect(descending[0].id).toBe(second.id);
    });

    it('[REPO-Q0030] should handle paranoid mode', async () => {
      const data = createTestLoginAttempt();
      await repository.create(data);
      await repository.softDeleteById(data.id);

      const notFound = await repository.findById(data.id);
      expect(notFound).toBeFalsy();

      const found = await repository.findById(data.id, { paranoid: false });
      expect(found).toBeTruthy();
    });
  });

  describe('error cases', () => {
    it('[REPO-E0010] should handle invalid id format', async () => {
      await expect(repository.findById('invalid-id')).rejects.toBeTruthy();
    });

    it('[REPO-E0020] should handle record not found', async () => {
      const result = await repository.findById(createTestLoginAttempt().id);
      expect(result).toBeFalsy();
    });

    it('[REPO-E0030] should handle validation errors', async () => {
      await expect(repository.create({} as any)).rejects.toBeTruthy();
    });
  });
}); 
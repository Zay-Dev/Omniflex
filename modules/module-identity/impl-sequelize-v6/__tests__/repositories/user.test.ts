import { Sequelize } from 'sequelize';
import { Containers } from '@omniflex/core';
import { createTestSequelize, setupTestDatabase, closeDatabase } from '@omniflex/infra-sequelize-v6/test-utils/sequelize.test-utils';
import { createTestUser } from '../../test-utils/factories';
import { clearModuleDatabase } from '../../test-utils/database';
import { createRepository } from '../../schemas/user';

describe('UserRepository', () => {
  let sequelize: Sequelize;
  let repository: ReturnType<typeof createRepository>;

  beforeAll(async () => {
    sequelize = createTestSequelize();
    Containers.asValues({ sequelize });

    repository = createRepository();

    await setupTestDatabase(sequelize);
  });

  beforeEach(async () => {
    await clearModuleDatabase(sequelize);
  });

  afterAll(async () => {
    await closeDatabase(sequelize);
  });

  describe('base operations', () => {
    it('[REPO-C0010] should create user', async () => {
      const data = createTestUser();
      const result = await repository.create(data);
      expect(result).toBeTruthy();
      expect(result.id).toBe(data.id);
      expect(result.identifier).toBe(data.identifier);
    });

    it('[REPO-R0010] should find user by id', async () => {
      const data = createTestUser();
      await repository.create(data);
      const result = await repository.findById(data.id);
      expect(result).toBeTruthy();
      expect(result?.id).toBe(data.id);
      expect(result?.identifier).toBe(data.identifier);
    });

    it('[REPO-R0020] should find user by identifier', async () => {
      const data = createTestUser({ identifier: 'specific_user' });
      await repository.create(data);
      const result = await repository.findOne({ identifier: 'specific_user' });
      expect(result).toBeTruthy();
      expect(result?.id).toBe(data.id);
    });

    it('[REPO-U0010] should update user by id', async () => {
      const data = createTestUser();
      await repository.create(data);
      const result = await repository.updateById(data.id, { isVerified: true });
      expect(result).toBeTruthy();
      expect(result?.isVerified).toBe(true);
    });

    it('[REPO-D0010] should delete user by id', async () => {
      const data = createTestUser();
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
        repository.create(createTestUser()),
        repository.create(createTestUser()),
        repository.create(createTestUser()),
      ]);

      const results = await repository.find({}, { skip: 1, take: 1 });
      expect(results).toHaveLength(1);
    });

    it('[REPO-Q0020] should handle sorting', async () => {
      const first = await repository.create(createTestUser({ identifier: 'a_user' }));
      const second = await repository.create(createTestUser({ identifier: 'b_user' }));

      const ascending = await repository.find({}, { sort: { identifier: 'asc' } });
      expect(ascending[0].id).toBe(first.id);

      const descending = await repository.find({}, { sort: { identifier: 'desc' } });
      expect(descending[0].id).toBe(second.id);
    });

    it('[REPO-Q0030] should handle paranoid mode', async () => {
      const data = createTestUser();
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
      const result = await repository.findById(createTestUser().id);
      expect(result).toBeFalsy();
    });

    it('[REPO-E0030] should handle validation errors', async () => {
      await expect(repository.create({} as any)).rejects.toBeTruthy();
    });
  });

  describe('unique constraints', () => {
    it('[REPO-E0040] should not create duplicate identifier', async () => {
      const data = createTestUser({ identifier: 'unique_user' });
      await repository.create(data);

      const duplicate = createTestUser({ identifier: 'unique_user' });
      await expect(repository.create(duplicate)).rejects.toBeTruthy();
    });

    it('[REPO-E0050] should allow reusing identifier after soft delete', async () => {
      const data = createTestUser({ identifier: 'reusable_user' });
      await repository.create(data);
      await repository.softDeleteById(data.id);

      const newUser = createTestUser({ identifier: 'reusable_user' });
      const result = await repository.create(newUser);
      expect(result).toBeTruthy();
      expect(result.identifier).toBe('reusable_user');
    });
  });
}); 
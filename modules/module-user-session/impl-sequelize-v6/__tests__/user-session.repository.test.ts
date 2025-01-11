import { createTestSequelize, setupTestDatabase, clearDatabase, closeDatabase } from '@omniflex/infra-sequelize-v6/test-utils/sequelize.test-utils';
import { createRepository } from '../schemas/user-sessions';
import { createTestUserSession } from '@omniflex/module-user-session-core/test-utils/factories';
import { createTestUser } from '../test-utils/factories';
import { Containers } from '@omniflex/core';
import * as Types from '@omniflex/infra-sequelize-v6/types';

describe('UserSessionRepository (Sequelize)', () => {
  const sequelize = createTestSequelize();
  Containers.asValues({ sequelize });
  const repository = createRepository();
  let testUser: ReturnType<typeof createTestUser>;

  beforeAll(async () => {
    sequelize.define('Users', {
      id: Types.id('UUID'),
    }, {
      tableName: 'Users',
      timestamps: true,
      paranoid: true,
    });

    await setupTestDatabase(sequelize);
  });

  afterAll(async () => {
    await closeDatabase(sequelize);
  });

  beforeEach(async () => {
    await clearDatabase(sequelize);
    testUser = createTestUser();
    await sequelize.models.Users.create(testUser);
  });

  describe('base operations', () => {
    it('[REPO-C0010] should create user session', async () => {
      const data = createTestUserSession({ userId: testUser.id });

      const result = await repository.create(data);

      expect(result).toBeTruthy();
      expect(result.id).toBeTruthy();
      expect(result.userId).toBe(testUser.id);
      expect(result.sessionType).toBe(data.sessionType);
    });

    it('[REPO-R0010] should find session by id', async () => {
      const data = createTestUserSession({ userId: testUser.id });
      const created = await repository.create(data);

      const result = await repository.findById(created.id);

      expect(result).toBeTruthy();
      expect(result?.id).toBe(created.id);
      expect(result?.userId).toBe(testUser.id);
    });

    it('[REPO-R0020] should find one session with filter', async () => {
      const data = createTestUserSession({ userId: testUser.id });
      await repository.create(data);

      const result = await repository.findOne({ userId: testUser.id });

      expect(result).toBeTruthy();
      expect(result?.userId).toBe(testUser.id);
    });

    it('[REPO-R0030] should find sessions with filter', async () => {
      const data = [
        createTestUserSession({ userId: testUser.id }),
        createTestUserSession({ userId: testUser.id }),
      ];
      await Promise.all(data.map(d => repository.create(d)));

      const result = await repository.find({ isActive: true });

      expect(result).toBeTruthy();
      expect(result.length).toBe(2);
    });

    it('[REPO-Q0010] should handle pagination', async () => {
      const data = [
        createTestUserSession({ userId: testUser.id }),
        createTestUserSession({ userId: testUser.id }),
        createTestUserSession({ userId: testUser.id }),
      ];
      await Promise.all(data.map(d => repository.create(d)));

      const result = await repository.find(
        { isActive: true },
        { skip: 1, take: 1 },
      );

      expect(result).toBeTruthy();
      expect(result.length).toBe(1);
    });

    it('[REPO-Q0020] should handle sorting', async () => {
      const now = new Date();
      const data = [
        createTestUserSession({
          userId: testUser.id,
          createdAt: new Date(now.getTime() - 1000),
        }),
        createTestUserSession({
          userId: testUser.id,
          createdAt: new Date(now.getTime() + 1000),
        }),
      ];
      await Promise.all(data.map(d => repository.create(d)));

      const result = await repository.find(
        { isActive: true },
        { sort: { createdAt: 'desc' } },
      );

      expect(result).toBeTruthy();
      expect(result.length).toBe(2);
      expect(new Date(result[0].createdAt).getTime())
        .toBeGreaterThan(new Date(result[1].createdAt).getTime());
    });

    it('[REPO-U0010] should update by id', async () => {
      const data = createTestUserSession({ userId: testUser.id });
      const created = await repository.create(data);
      const update = { isActive: false };

      const result = await repository.updateById(created.id, update);

      expect(result).toBeTruthy();
      expect(result?.isActive).toBe(false);
    });

    it('[REPO-U0020] should update one', async () => {
      const data = createTestUserSession({ userId: testUser.id });
      await repository.create(data);
      const update = { isActive: false };

      const result = await repository.updateOne({ userId: testUser.id }, update);

      expect(result).toBeTruthy();
      expect(result?.isActive).toBe(false);
    });

    it('[REPO-U0030] should update many', async () => {
      const data = [
        createTestUserSession({ userId: testUser.id }),
        createTestUserSession({ userId: testUser.id }),
      ];
      await Promise.all(data.map(d => repository.create(d)));
      const filter = { isActive: true };
      const update = { isActive: false };

      const result = await repository.update(filter, update);

      expect(result).toBe(2);
      const updated = await repository.find({ isActive: false });
      expect(updated.length).toBe(2);
    });

    it('[REPO-D0010] should delete by id', async () => {
      const data = createTestUserSession({ userId: testUser.id });
      const created = await repository.create(data);

      const result = await repository.deleteById(created.id);

      expect(result).toBe(true);
      const deleted = await repository.findById(created.id);
      expect(deleted).toBeFalsy();
    });

    it('[REPO-A0010] should soft delete by id', async () => {
      const data = createTestUserSession({ userId: testUser.id });
      const created = await repository.create(data);

      const result = await repository.softDeleteById(created.id);

      expect(result).toBe(true);
      const deleted = await repository.findById(created.id);
      expect(deleted).toBeFalsy();
    });

    it('[REPO-S0010] should restore by id', async () => {
      const data = createTestUserSession({ userId: testUser.id });
      const created = await repository.create(data);
      await repository.softDeleteById(created.id);

      const result = await repository.restoreById(created.id);

      expect(result).toBe(true);
      const restored = await repository.findById(created.id);
      expect(restored).toBeTruthy();
    });
  });

  describe('error cases', () => {
    it('[REPO-E0010] should handle non-existent record', async () => {
      const result = await repository.findById('00000000-0000-0000-0000-000000000000');
      expect(result).toBeFalsy();
    });

    it('[REPO-E0020] should handle validation error', async () => {
      const invalidData = createTestUserSession({ userId: undefined });
      await expect(repository.create(invalidData)).rejects.toBeTruthy();
    });
  });

  describe('custom operations', () => {
    it('[REPO-U0040] should deactivate all sessions for user', async () => {
      const data = [
        createTestUserSession({ userId: testUser.id, isActive: true }),
        createTestUserSession({ userId: testUser.id, isActive: true }),
      ];
      await Promise.all(data.map(d => repository.create(d)));

      await repository.deactivateByUserId(testUser.id);

      const result = await repository.find({ userId: testUser.id, isActive: true });
      expect(result.length).toBe(0);
    });

    it('[REPO-U0050] should deactivate sessions by type', async () => {
      const sessionType = 'refresh';
      const data = [
        createTestUserSession({ userId: testUser.id, sessionType, isActive: true }),
        createTestUserSession({ userId: testUser.id, sessionType: 'access', isActive: true }),
      ];
      await Promise.all(data.map(d => repository.create(d)));

      await repository.deactivateBySessionType(testUser.id, sessionType);

      const result = await repository.find({ userId: testUser.id, sessionType, isActive: true });
      expect(result.length).toBe(0);
    });
  });
});
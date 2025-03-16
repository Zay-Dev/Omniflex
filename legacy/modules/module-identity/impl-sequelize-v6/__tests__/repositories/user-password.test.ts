import { Sequelize } from 'sequelize';
import { Containers } from '@omniflex/core';
import { createTestSequelize, setupTestDatabase, closeDatabase } from '@omniflex/infra-sequelize-v6/test-utils/sequelize.test-utils';
import { createTestUserPassword } from '../../test-utils/factories';
import { clearModuleDatabase } from '../../test-utils/database';
import { createRepository as createUserPasswordRepository } from '../../schemas/user-password';
import { createRepository as createUserRepository } from '../../schemas/user';

describe('UserPasswordRepository', () => {
  let sequelize: Sequelize;
  let repository: ReturnType<typeof createUserPasswordRepository>;
  let userRepository: ReturnType<typeof createUserRepository>;

  beforeAll(async () => {
    sequelize = createTestSequelize();
    Containers.asValues({ sequelize });

    // Create both repositories to register models
    userRepository = createUserRepository();
    repository = createUserPasswordRepository();

    await setupTestDatabase(sequelize);
  });

  beforeEach(async () => {
    await clearModuleDatabase(sequelize);
  });

  afterAll(async () => {
    await closeDatabase(sequelize);
  });

  describe('base operations', () => {
    it('[REPO-C0010] should create user password', async () => {
      const data = createTestUserPassword();
      const { id, identifier, isVerified, lastSignInAtUtc } = data.user;
      await userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });

      const { user, ...passwordData } = data;
      const result = await repository.create(passwordData);
      expect(result).toBeTruthy();
      expect(result.id).toBe(data.id);
    });

    it('[REPO-R0010] should find user password by id', async () => {
      const data = createTestUserPassword();
      const { id, identifier, isVerified, lastSignInAtUtc } = data.user;
      await userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });

      const { user, ...passwordData } = data;
      await repository.create(passwordData);
      const result = await repository.findById(data.id);
      expect(result).toBeTruthy();
      expect(result?.id).toBe(data.id);
    });

    it('[REPO-R0020] should find user password by filter', async () => {
      const data = createTestUserPassword({ username: 'specific_user' });
      const { id, identifier, isVerified, lastSignInAtUtc } = data.user;
      await userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });

      const { user, ...passwordData } = data;
      await repository.create(passwordData);
      const result = await repository.findOne({ username: 'specific_user' });
      expect(result).toBeTruthy();
      expect(result?.id).toBe(data.id);
    });

    it('[REPO-U0010] should update user password by id', async () => {
      const data = createTestUserPassword();
      const { id, identifier, isVerified, lastSignInAtUtc } = data.user;
      await userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });

      const { user, ...passwordData } = data;
      await repository.create(passwordData);
      const result = await repository.updateById(data.id, { salt: 'new_salt' });
      expect(result).toBeTruthy();
      expect(result?.salt).toBe('new_salt');
    });

    it('[REPO-D0010] should delete user password by id', async () => {
      const data = createTestUserPassword();
      const { id, identifier, isVerified, lastSignInAtUtc } = data.user;
      await userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });

      const { user, ...passwordData } = data;
      await repository.create(passwordData);
      const deleted = await repository.deleteById(data.id);
      expect(deleted).toBe(true);
      const result = await repository.findById(data.id);
      expect(result).toBeFalsy();
    });
  });

  describe('query options', () => {
    it('[REPO-Q0010] should handle pagination', async () => {
      const items = [
        createTestUserPassword(),
        createTestUserPassword(),
        createTestUserPassword(),
      ];

      await Promise.all(items.map(item => {
        const { id, identifier, isVerified, lastSignInAtUtc } = item.user;
        return userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });
      }));

      await Promise.all(items.map(item => {
        const { user, ...passwordData } = item;
        return repository.create(passwordData);
      }));

      const results = await repository.find({}, { skip: 1, take: 1 });
      expect(results).toHaveLength(1);
    });

    it('[REPO-Q0020] should handle sorting', async () => {
      const first = createTestUserPassword({ username: 'a_user' });
      const second = createTestUserPassword({ username: 'b_user' });

      await Promise.all([first, second].map(item => {
        const { id, identifier, isVerified, lastSignInAtUtc } = item.user;
        return userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });
      }));

      const firstResult = await repository.create({ ...first, user: undefined });
      const secondResult = await repository.create({ ...second, user: undefined });

      const ascending = await repository.find({}, { sort: { username: 'asc' } });
      expect(ascending[0].id).toBe(firstResult.id);

      const descending = await repository.find({}, { sort: { username: 'desc' } });
      expect(descending[0].id).toBe(secondResult.id);
    });

    it('[REPO-Q0030] should handle paranoid mode', async () => {
      const data = createTestUserPassword();
      const { id, identifier, isVerified, lastSignInAtUtc } = data.user;
      await userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });

      const { user, ...passwordData } = data;
      await repository.create(passwordData);
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
      const result = await repository.findById(createTestUserPassword().id);
      expect(result).toBeFalsy();
    });

    it('[REPO-E0030] should handle validation errors', async () => {
      await expect(repository.create({} as any)).rejects.toBeTruthy();
    });
  });
}); 
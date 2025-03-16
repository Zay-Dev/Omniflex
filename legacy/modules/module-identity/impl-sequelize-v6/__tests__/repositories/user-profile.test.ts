import { Sequelize } from 'sequelize';
import { Containers } from '@omniflex/core';
import { createTestSequelize, setupTestDatabase, closeDatabase } from '@omniflex/infra-sequelize-v6/test-utils/sequelize.test-utils';
import { createTestUserProfile } from '../../test-utils/factories';
import { clearModuleDatabase } from '../../test-utils/database';
import { createRepository as createUserProfileRepository } from '../../schemas/user-profile';
import { createRepository as createUserRepository } from '../../schemas/user';

describe('UserProfileRepository', () => {
  let sequelize: Sequelize;
  let repository: ReturnType<typeof createUserProfileRepository>;
  let userRepository: ReturnType<typeof createUserRepository>;

  beforeAll(async () => {
    sequelize = createTestSequelize();
    Containers.asValues({ sequelize });

    // Create both repositories to register models
    userRepository = createUserRepository();
    repository = createUserProfileRepository();

    await setupTestDatabase(sequelize);
  });

  beforeEach(async () => {
    await clearModuleDatabase(sequelize);
  });

  afterAll(async () => {
    await closeDatabase(sequelize);
  });

  describe('base operations', () => {
    it('[REPO-C0010] should create user profile', async () => {
      const data = createTestUserProfile();
      const { id, identifier, isVerified, lastSignInAtUtc } = data.user;
      await userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });

      const { user, ...profileData } = data;
      const result = await repository.create({
        ...profileData,
        userId: data.userId,
      });
      expect(result).toBeTruthy();
      expect(result.id).toBe(data.id);
    });

    it('[REPO-R0010] should find user profile by id', async () => {
      const data = createTestUserProfile();
      const { id, identifier, isVerified, lastSignInAtUtc } = data.user;
      await userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });

      const { user, ...profileData } = data;
      await repository.create({
        ...profileData,
        userId: data.userId,
      });
      const result = await repository.findById(data.id);
      expect(result).toBeTruthy();
      expect(result?.id).toBe(data.id);
    });

    it('[REPO-R0020] should find user profile by filter', async () => {
      const data = createTestUserProfile({ email: 'specific@example.com' });
      const { id, identifier, isVerified, lastSignInAtUtc } = data.user;
      await userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });

      const { user, ...profileData } = data;
      await repository.create({
        ...profileData,
        userId: data.userId,
      });
      const result = await repository.findOne({ email: 'specific@example.com' });
      expect(result).toBeTruthy();
      expect(result?.id).toBe(data.id);
    });

    it('[REPO-U0010] should update user profile by id', async () => {
      const data = createTestUserProfile();
      const { id, identifier, isVerified, lastSignInAtUtc } = data.user;
      await userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });

      const { user, ...profileData } = data;
      await repository.create({
        ...profileData,
        userId: data.userId,
      });
      const result = await repository.updateById(data.id, { firstName: 'Updated' });
      expect(result).toBeTruthy();
      expect(result?.firstName).toBe('Updated');
    });

    it('[REPO-D0010] should delete user profile by id', async () => {
      const data = createTestUserProfile();
      const { id, identifier, isVerified, lastSignInAtUtc } = data.user;
      await userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });

      const { user, ...profileData } = data;
      await repository.create({
        ...profileData,
        userId: data.userId,
      });
      const deleted = await repository.deleteById(data.id);
      expect(deleted).toBe(true);
      const result = await repository.findById(data.id);
      expect(result).toBeFalsy();
    });
  });

  describe('query options', () => {
    it('[REPO-Q0010] should handle pagination', async () => {
      const items = [
        createTestUserProfile(),
        createTestUserProfile(),
        createTestUserProfile(),
      ];

      await Promise.all(items.map(item => {
        const { id, identifier, isVerified, lastSignInAtUtc } = item.user;
        return userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });
      }));

      await Promise.all(items.map(item => {
        const { user, ...profileData } = item;
        return repository.create({
          ...profileData,
          userId: item.userId,
        });
      }));

      const results = await repository.find({}, { skip: 1, take: 1 });
      expect(results).toHaveLength(1);
    });

    it('[REPO-Q0020] should handle sorting', async () => {
      const first = createTestUserProfile({ email: 'a@example.com' });
      const second = createTestUserProfile({ email: 'b@example.com' });

      await Promise.all([first, second].map(item => {
        const { id, identifier, isVerified, lastSignInAtUtc } = item.user;
        return userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });
      }));

      const firstResult = await repository.create({ ...first, user: undefined });
      const secondResult = await repository.create({ ...second, user: undefined });

      const ascending = await repository.find({}, { sort: { email: 'asc' } });
      expect(ascending[0].id).toBe(firstResult.id);

      const descending = await repository.find({}, { sort: { email: 'desc' } });
      expect(descending[0].id).toBe(secondResult.id);
    });

    it('[REPO-Q0030] should handle paranoid mode', async () => {
      const data = createTestUserProfile();
      const { id, identifier, isVerified, lastSignInAtUtc } = data.user;
      await userRepository.create({ id, identifier, isVerified, lastSignInAtUtc });

      const { user, ...profileData } = data;
      await repository.create({
        ...profileData,
        userId: data.userId,
      });
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
      const result = await repository.findById(createTestUserProfile().id);
      expect(result).toBeFalsy();
    });

    it('[REPO-E0030] should handle validation errors', async () => {
      await expect(repository.create({} as any)).rejects.toBeTruthy();
    });
  });
}); 
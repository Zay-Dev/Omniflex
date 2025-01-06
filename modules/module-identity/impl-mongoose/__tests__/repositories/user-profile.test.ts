import { Types, Connection } from 'mongoose';
import { Containers } from '@omniflex/core';
import { startMemoryServer, stopMemoryServer, clearDatabase } from '@omniflex/infra-mongoose/test-utils/mongoose.memory';

import { createRepository, UserProfiles } from '../../schemas/user-profile';
import { createTestUserProfile } from '@omniflex/module-identity-core/test-utils/factories';

const mongoId = () => new Types.ObjectId();

describe('UserProfile Repository Integration', () => {
  let mongoose: Connection;
  let repository: UserProfiles;

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
    it('[REPO-I0010] should find profile by id', async () => {
      const profile = createTestUserProfile({
        id: mongoId() as any,
        userId: mongoId() as any,
      });
      const created = await repository.create(profile);

      const found = await repository.findById(created.id);
      expect(found).toBeDefined();
      expect(found).toMatchObject({
        id: created.id,
        userId: profile.userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
    });

    it('[REPO-I0020] should return null for non-existent id', async () => {
      const found = await repository.findById(mongoId().toString());
      expect(found).toBeNull();
    });

    it('[REPO-I0030] should not find soft deleted profile', async () => {
      const profile = createTestUserProfile({
        id: mongoId() as any,
        userId: mongoId() as any,
      });
      const created = await repository.create(profile);
      await repository.softDeleteById(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('[REPO-I0040] should find profile by user id', async () => {
      const profile = createTestUserProfile({
        id: mongoId() as any,
        userId: mongoId() as any,
      });
      await repository.create(profile);

      const found = await repository.findOne({ userId: profile.userId });
      expect(found).toBeDefined();
      expect(found).toMatchObject({
        userId: profile.userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
    });

    it('[REPO-I0050] should return null for non-existent user id', async () => {
      const found = await repository.findOne({ userId: mongoId().toString() });
      expect(found).toBeNull();
    });

    it('[REPO-I0060] should not find soft deleted profile', async () => {
      const profile = createTestUserProfile({
        id: mongoId() as any,
        userId: mongoId() as any,
      });
      const created = await repository.create(profile);
      await repository.softDeleteById(created.id);

      const found = await repository.findOne({ userId: profile.userId });
      expect(found).toBeNull();
    });
  });

  describe('create', () => {
    it('[REPO-I0070] should create profile', async () => {
      const profile = createTestUserProfile({
        id: mongoId() as any,
        userId: mongoId() as any,
      });
      const created = await repository.create(profile);

      expect(created).toBeDefined();
      expect(created).toMatchObject({
        userId: profile.userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        deletedAt: null,
      });
    });

    it('[REPO-I0080] should not create duplicate user id', async () => {
      const profile = createTestUserProfile({
        id: mongoId() as any,
        userId: mongoId() as any,
      });
      await repository.create(profile);

      const duplicate = createTestUserProfile({
        id: mongoId() as any,
        userId: profile.userId,
      });

      await expect(repository.create(duplicate)).rejects.toThrow();
    });
  });

  describe('softDelete', () => {
    it('[REPO-I0090] should soft delete profile', async () => {
      const profile = createTestUserProfile({
        id: mongoId() as any,
        userId: mongoId() as any,
      });
      const created = await repository.create(profile);
      await repository.softDeleteById(created.id);

      const found = await repository.findById(created.id, { paranoid: false });
      expect(found).toBeDefined();
      expect(found?.deletedAt).toBeDefined();
    });

    it('[REPO-I0100] should allow reusing user id after soft delete', async () => {
      const profile = createTestUserProfile({
        id: mongoId() as any,
        userId: mongoId() as any,
      });
      const created = await repository.create(profile);
      await repository.softDeleteById(created.id);

      const newProfile = createTestUserProfile({
        id: mongoId() as any,
        userId: profile.userId,
      });

      const result = await repository.create(newProfile);
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        userId: profile.userId,
      });
    });
  });
}); 
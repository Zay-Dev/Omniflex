import { Connection } from 'mongoose';
import { UserSessions, createRepository } from '../schemas/user-sessions';
import { createTestUserSession } from '@omniflex/module-user-session-core/test-utils/factories';
import { Containers } from '@omniflex/core';
import { createMockConnection, createMockMongooseModel } from '@omniflex/infra-mongoose/test-utils/mongoose.mock';

describe('UserSessionRepository (Mongoose)', () => {
  let mongoose: Connection;
  let repository: UserSessions;

  beforeAll(async () => {
    mongoose = createMockConnection() as Connection;
    const mockModel = createMockMongooseModel();
    mongoose.model = jest.fn().mockReturnValue(mockModel);
    Containers.asValues({ mongoose });
    repository = createRepository();
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const mockModel = createMockMongooseModel();
    mongoose.model = jest.fn().mockReturnValue(mockModel);
  });

  describe('base operations', () => {
    it('[REPO-C0010] should create session', async () => {
      const data = createTestUserSession();
      const result = await repository.create(data);

      expect(result).toEqual(expect.objectContaining({
        ...data,
        id: expect.any(String),
      }));
    });

    it('[REPO-R0010] should find session by id', async () => {
      const data = createTestUserSession();
      const created = await repository.create(data);
      const result = await repository.findById(created.id);

      expect(result).toEqual(expect.objectContaining({
        ...data,
        id: created.id,
      }));
    });

    it('[REPO-R0020] should find session by criteria', async () => {
      const data = createTestUserSession();
      const created = await repository.create(data);
      const result = await repository.findOne({ id: created.id });

      expect(result).toEqual(expect.objectContaining({
        ...data,
        id: created.id,
      }));
    });

    it('[REPO-R0030] should find sessions by criteria', async () => {
      const data = createTestUserSession();
      const created = await repository.create(data);
      const result = await repository.find({ id: created.id });

      expect(result).toEqual([
        expect.objectContaining({
          ...data,
          id: created.id,
        }),
      ]);
    });

    it('[REPO-U0010] should update session by id', async () => {
      const data = createTestUserSession();
      const created = await repository.create(data);
      const update = { isActive: false };
      await repository.updateById(created.id, update);
      const result = await repository.findById(created.id);

      expect(result).toEqual(expect.objectContaining({
        ...data,
        ...update,
        id: created.id,
      }));
    });

    it('[REPO-U0020] should update session by criteria', async () => {
      const data = createTestUserSession();
      const created = await repository.create(data);
      const update = { isActive: false };
      await repository.updateOne({ id: created.id }, update);
      const result = await repository.findById(created.id);

      expect(result).toEqual(expect.objectContaining({
        ...data,
        ...update,
        id: created.id,
      }));
    });

    it('[REPO-U0030] should update sessions by criteria', async () => {
      const data = createTestUserSession();
      const created = await repository.create(data);
      const update = { isActive: false };
      await repository.update({ id: created.id }, update);
      const result = await repository.findById(created.id);

      expect(result).toEqual(expect.objectContaining({
        ...data,
        ...update,
        id: created.id,
      }));
    });

    it('[REPO-D0010] should delete session by id', async () => {
      const data = createTestUserSession();
      const created = await repository.create(data);
      await repository.deleteById(created.id);
      const result = await repository.findById(created.id);

      expect(result).toBeNull();
    });

    it('[REPO-D0020] should delete session by criteria', async () => {
      const data = createTestUserSession();
      const created = await repository.create(data);
      await repository.deleteOne({ id: created.id });
      const result = await repository.findById(created.id);

      expect(result).toBeNull();
    });

    it('[REPO-D0030] should delete sessions by criteria', async () => {
      const data = createTestUserSession();
      const created = await repository.create(data);
      await repository.delete({ id: created.id });
      const result = await repository.findById(created.id);

      expect(result).toBeNull();
    });
  });

  describe('custom operations', () => {
    it('[REPO-U0040] should deactivate sessions by user id', async () => {
      const data = createTestUserSession();
      const created = await repository.create(data);
      await repository.deactivateByUserId(created.userId);
      const result = await repository.findById(created.id);

      expect(result).toEqual(expect.objectContaining({
        ...data,
        isActive: false,
        id: created.id,
      }));
    });

    it('[REPO-U0050] should deactivate sessions by session type', async () => {
      const data = createTestUserSession();
      const created = await repository.create(data);
      await repository.deactivateBySessionType(created.userId, created.sessionType);
      const result = await repository.findById(created.id);

      expect(result).toEqual(expect.objectContaining({
        ...data,
        isActive: false,
        id: created.id,
      }));
    });
  });
});
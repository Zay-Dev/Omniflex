import { Schema } from 'mongoose';

import { MongooseBaseRepository } from './repository';
import { startMemoryServer, stopMemoryServer, clearDatabase, createModel, createObjectId } from './test-utils/mongoose.memory';

interface ITestModel {
  _id: string;
  deletedAt?: Date;
  name: string;
  isActive?: boolean;
}

const TestSchema = new Schema<ITestModel>({
  deletedAt: { type: Date },
  name: { type: String, required: true },
  isActive: { type: Boolean },
}, {
  timestamps: true,
});

describe('MongooseBaseRepository', () => {
  let repository: MongooseBaseRepository<ITestModel>;
  let TestModel;

  beforeAll(async () => {
    await startMemoryServer();
    TestModel = createModel<ITestModel>('Test', TestSchema);
  });

  afterAll(async () => {
    await stopMemoryServer();
  });

  beforeEach(async () => {
    await clearDatabase();
    repository = new MongooseBaseRepository(TestModel);
  });

  describe('exists', () => {
    it('[REPO-E0010] should check if record exists', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test' });

      const result = await repository.exists({ _id: mockId });

      expect(result).toBe(true);
    });

    it('[REPO-E0020] should check if record exists with paranoid false', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });

      const result = await repository.exists({ _id: mockId }, { paranoid: false });

      expect(result).toBe(true);
    });

    it('[REPO-E0030] should not find soft deleted record by default', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });

      const result = await repository.exists({ _id: mockId });

      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('[REPO-R0010] should find record by id', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test' });

      const result = await repository.findById(mockId);

      expect(result).toBeTruthy();
      expect(result!._id.toString()).toBe(mockId);
      expect(result!.name).toBe('test');
    });

    it('[REPO-R0020] should not find soft deleted record', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });

      const result = await repository.findById(mockId);

      expect(result).toBeNull();
    });

    it('[REPO-E0010] should handle invalid id format', async () => {
      await expect(repository.findById('invalid-id')).rejects.toBeTruthy();
    });

    it('[REPO-E0020] should handle non-existent id', async () => {
      const result = await repository.findById(createObjectId());
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('[REPO-R0030] should find one record with filter', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test' });

      const result = await repository.findOne({ name: 'test' });

      expect(result).toBeTruthy();
      expect(result!._id.toString()).toBe(mockId);
      expect(result!.name).toBe('test');
    });

    it('[REPO-R0040] should not find soft deleted record by default', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });

      const result = await repository.findOne({ name: 'test' });

      expect(result).toBeNull();
    });
  });

  describe('find', () => {
    it('[REPO-R0040] should find records with filter', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', isActive: true });

      const result = await repository.find({ isActive: true });

      expect(result).toBeTruthy();
      expect(result).toHaveLength(1);
      expect(result[0]._id.toString()).toBe(mockId);
      expect(result[0].name).toBe('test');
    });

    it('[REPO-R0050] should not find soft deleted records by default', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', isActive: true, deletedAt: new Date() });

      const result = await repository.find({ isActive: true });

      expect(result).toHaveLength(0);
    });

    it('[REPO-Q0010] should handle pagination', async () => {
      await TestModel.create({ name: 'test1' });
      await TestModel.create({ name: 'test2' });
      await TestModel.create({ name: 'test3' });

      const result = await repository.find({}, { skip: 1, take: 1 });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('test2');
    });

    it('[REPO-Q0020] should handle sorting', async () => {
      await TestModel.create({ name: 'test1' });
      await TestModel.create({ name: 'test2' });

      const result = await repository.find({}, { sort: { name: 'desc' } });

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('test2');
      expect(result[1].name).toBe('test1');
    });

    it('[REPO-Q0030] should handle paranoid mode', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });

      const result = await repository.find({}, { paranoid: false });

      expect(result).toHaveLength(1);
      expect(result[0]._id.toString()).toBe(mockId);
    });
  });

  describe('create', () => {
    it('[REPO-C0010] should create record', async () => {
      const mockId = createObjectId();
      const data = { _id: mockId, name: 'test' };

      const result = await repository.create(data);

      expect(result!._id.toString()).toBe(mockId);
      expect(result!.name).toBe('test');
    });

    it('[REPO-E0030] should handle validation errors', async () => {
      const data = { _id: createObjectId() } as any;

      await expect(repository.create(data)).rejects.toBeTruthy();
    });
  });

  describe('updateById', () => {
    it('[REPO-U0010] should update record by id', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test' });
      const update = { name: 'updated' };

      const result = await repository.updateById(mockId, update);

      expect(result!._id.toString()).toBe(mockId);
      expect(result!.name).toBe('updated');
    });

    it('[REPO-U0020] should not update soft deleted record by default', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });
      const update = { name: 'updated' };

      const result = await repository.updateById(mockId, update);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('[REPO-U0020] should update multiple records', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: true });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: true });
      const update = { name: 'updated' };

      await repository.update({ isActive: true }, update);

      const records = await repository.find({ isActive: true });
      expect(records).toHaveLength(2);
      expect(records.every(r => r.name === 'updated')).toBe(true);
    });

    it('[REPO-U0030] should not update soft deleted records by default', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: true, deletedAt: new Date() });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: true, deletedAt: new Date() });
      const update = { name: 'updated' };

      await repository.update({ isActive: true }, update);

      const records = await repository.find({ isActive: true }, { paranoid: false });
      expect(records).toHaveLength(2);
      expect(records.every(r => r.name === 'test1' || r.name === 'test2')).toBe(true);
    });
  });

  describe('deleteById', () => {
    it('[REPO-D0010] should hard delete record by id', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test' });

      const result = await repository.deleteById(mockId);

      expect(result).toBe(true);
      const record = await repository.findById(mockId);
      expect(record).toBeNull();
    });
  });

  describe('deleteOne', () => {
    it('[REPO-D0020] should hard delete one record', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', isActive: false });

      const result = await repository.deleteOne({ isActive: false });

      expect(result).toBe(true);
      const record = await repository.findById(mockId);
      expect(record).toBeNull();
    });
  });

  describe('delete', () => {
    it('[REPO-D0030] should hard delete multiple records', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: false });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: false });

      await repository.delete({ isActive: false });

      const records = await repository.find({ isActive: false });
      expect(records).toHaveLength(0);
    });
  });

  describe('softDeleteById', () => {
    it('[REPO-D0040] should soft delete record by id', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test' });

      const result = await repository.softDeleteById(mockId);

      expect(result).toBe(true);
      const record = await repository.findById(mockId, { paranoid: false });
      expect(record!.deletedAt).toBeTruthy();
    });
  });

  describe('restore', () => {
    it('[REPO-S0010] should restore record by id', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });

      const result = await repository.restoreById(mockId);

      expect(result).toBe(true);
      const record = await repository.findById(mockId);
      expect(record).toBeTruthy();
      expect(record!.deletedAt).toBeNull();
    });

    it('[REPO-S0020] should restore multiple records', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: false, deletedAt: new Date() });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: false, deletedAt: new Date() });

      await repository.restore({ isActive: false });

      const records = await repository.find({ isActive: false });
      expect(records).toHaveLength(2);
      expect(records.every(r => r.deletedAt === null)).toBe(true);
    });
  });
}); 
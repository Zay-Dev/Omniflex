import { Schema, Types, UpdateQuery } from 'mongoose';
import { TQueryOperators } from '@omniflex/core/types/repository';

import { MongooseBaseRepository } from '../../repository';
import { startMemoryServer, stopMemoryServer, clearDatabase, createModel, createObjectId } from '../../test-utils/mongoose.memory';

interface ITestModel {
  _id: Types.ObjectId;
  deletedAt?: Date;
  name: string;
  isActive?: boolean;
  refId?: Types.ObjectId;
}

const TestSchema = new Schema<ITestModel>({
  deletedAt: { type: Date },
  name: { type: String, required: true },
  isActive: { type: Boolean },
  refId: { type: Schema.Types.ObjectId },
}, {
  timestamps: true,
});

describe('MongooseBaseRepository', () => {
  let repository: MongooseBaseRepository<ITestModel, Types.ObjectId>;
  let TestModel;

  beforeAll(async () => {
    await startMemoryServer();
  });

  afterAll(async () => {
    await stopMemoryServer();
  });

  beforeEach(async () => {
    await clearDatabase();
    TestModel = createModel<ITestModel>('Test', TestSchema);
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
      expect(result!._id.equals(mockId)).toBe(true);
      expect(result!.name).toBe('test');
    });

    it('[REPO-R0020] should not find soft deleted record', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });

      const result = await repository.findById(mockId);

      expect(result).toBeNull();
    });

    it('[REPO-E0010] should handle invalid id format', async () => {
      await expect(repository.findById('invalid-id' as any)).rejects.toBeTruthy();
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
      expect(result!._id.equals(mockId)).toBe(true);
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
      expect(result[0]._id.equals(mockId)).toBe(true);
      expect(result[0].name).toBe('test');
    });

    it('[REPO-R0045] should find records with ObjectId in filter', async () => {
      const refId = createObjectId();
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', refId });

      const result = await repository.find({ refId });

      expect(result).toBeTruthy();
      expect(result).toHaveLength(1);
      expect(result[0]._id.equals(mockId)).toBe(true);
      expect(result[0].name).toBe('test');
    });

    it('[REPO-R0046] should find records with ObjectId using operators', async () => {
      const refId1 = createObjectId();
      const refId2 = createObjectId();
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();

      await TestModel.create({ _id: mockId1, name: 'test1', refId: refId1 });
      await TestModel.create({ _id: mockId2, name: 'test2', refId: refId2 });

      const result = await repository.find({
        refId: { $in: [refId1, refId2] }
      });

      expect(result).toBeTruthy();
      expect(result).toHaveLength(2);
      expect(result.map(r => r.name).sort()).toEqual(['test1', 'test2']);
    });

    it('[REPO-R0047] should handle mixed ObjectId and operator filters', async () => {
      const refId = createObjectId();
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();

      await TestModel.create({ _id: mockId1, name: 'test1', refId, isActive: true });
      await TestModel.create({ _id: mockId2, name: 'test2', refId, isActive: false });

      const result = await repository.find({
        refId,
        isActive: { $eq: true }
      });

      expect(result).toBeTruthy();
      expect(result).toHaveLength(1);
      expect(result[0]._id.equals(mockId1)).toBe(true);
      expect(result[0].name).toBe('test1');
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
      expect(result[0]._id.equals(mockId)).toBe(true);
    });
  });

  describe('create', () => {
    it('[REPO-C0010] should create record', async () => {
      const mockId = createObjectId();
      const data = { _id: mockId, name: 'test' };

      const result = await repository.create(data);

      expect(result!._id.equals(mockId)).toBe(true);
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

      expect(result!._id.equals(mockId)).toBe(true);
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

    it('[REPO-U0040] should handle operator-based updates', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', isActive: true });

      const update: UpdateQuery<ITestModel> = {
        $set: { name: 'updated' },
        isActive: false
      };

      const result = await repository.update({ _id: mockId }, update);

      expect(result).toBe(1);
      const record = await repository.findById(mockId);
      expect(record!.name).toBe('updated');
      expect(record!.isActive).toBe(false);
    });

    it('[REPO-U0041] should handle complex operator updates', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: true });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: true });

      const update: UpdateQuery<ITestModel> = {
        $set: { name: 'updated' },
        $unset: { isActive: '' }
      };

      const result = await repository.update({ isActive: true }, update);

      expect(result).toBe(2);
      const records = await repository.find({});
      expect(records).toHaveLength(2);
      expect(records.every(r => r.name === 'updated')).toBe(true);
      expect(records.every(r => r.isActive === undefined)).toBe(true);
    });

    it('[REPO-U0042] should return 0 when no records match filter', async () => {
      const update: UpdateQuery<ITestModel> = {
        $set: { isActive: false }
      };

      const result = await repository.update({ name: 'non-existent' }, update);

      expect(result).toBe(0);
    });
  });

  describe('deleteById', () => {
    it('[REPO-D1010] should delete existing document', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test' });

      const result = await repository.deleteById(mockId);

      expect(result).toBe(true);
      const record = await repository.findById(mockId);
      expect(record).toBeNull();
    });

    it('[REPO-D1020] should return false for non-existent document', async () => {
      const mockId = createObjectId();
      const result = await repository.deleteById(mockId);

      expect(result).toBe(false);
    });

    it('[REPO-D1030] should handle invalid id format', async () => {
      await expect(repository.deleteById('invalid-id' as any)).rejects.toBeTruthy();
    });
  });

  describe('deleteOne', () => {
    it('[REPO-D1040] should delete with simple filter', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', isActive: true });
      await TestModel.create({ name: 'test2', isActive: true });

      const result = await repository.deleteOne({ name: 'test' });

      expect(result).toBe(true);
      const record = await repository.findById(mockId);
      expect(record).toBeNull();
      
      // Verify other records remain
      const remaining = await repository.find({ isActive: true });
      expect(remaining).toHaveLength(1);
      expect(remaining[0].name).toBe('test2');
    });

    it('[REPO-D1050] should delete with ObjectId filter', async () => {
      const refId = createObjectId();
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', refId });
      await TestModel.create({ _id: mockId2, name: 'test2', refId });

      const result = await repository.deleteOne({ refId });

      expect(result).toBe(true);
      // Verify only one document was deleted
      const remaining = await repository.find({ refId });
      expect(remaining).toHaveLength(1);
    });

    it('[REPO-D1060] should delete with operator filter', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: true });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: true });

      const result = await repository.deleteOne({
        name: { $regex: /test\d/ },
        isActive: { $eq: true }
      });

      expect(result).toBe(true);
      // Verify only one document was deleted
      const remaining = await repository.find({ isActive: true });
      expect(remaining).toHaveLength(1);
    });

    it('[REPO-D1070] should handle non-existent document', async () => {
      const result = await repository.deleteOne({ name: 'non-existent' });

      expect(result).toBe(false);
    });

    it('[REPO-D1080] should not delete soft-deleted documents', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });

      const result = await repository.deleteOne({ _id: mockId });

      expect(result).toBe(false);
      // Verify document still exists
      const record = await repository.findById(mockId, { paranoid: false });
      expect(record).toBeTruthy();
    });
  });

  describe('delete', () => {
    it('[REPO-D2010] should delete multiple documents', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: true });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: true });
      await TestModel.create({ name: 'test3', isActive: false });

      const result = await repository.delete({ isActive: true });

      expect(result).toBe(2);
      const remaining = await repository.find({});
      expect(remaining).toHaveLength(1);
      expect(remaining[0].isActive).toBe(false);
    });

    it('[REPO-D2020] should delete with ObjectId filter', async () => {
      const refId = createObjectId();
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', refId });
      await TestModel.create({ _id: mockId2, name: 'test2', refId });
      await TestModel.create({ name: 'test3' });

      const result = await repository.delete({ refId });

      expect(result).toBe(2);
      const remaining = await repository.find({});
      expect(remaining).toHaveLength(1);
      expect(remaining[0].name).toBe('test3');
    });

    it('[REPO-D2030] should delete with operator filter', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: true });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: true });
      await TestModel.create({ name: 'test3', isActive: false });

      const result = await repository.delete({
        name: { $regex: /test\d/ },
        isActive: { $eq: true }
      });

      expect(result).toBe(2);
      const remaining = await repository.find({});
      expect(remaining).toHaveLength(1);
      expect(remaining[0].isActive).toBe(false);
    });

    it('[REPO-D2040] should return correct delete count', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: true });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: true });
      await TestModel.create({ name: 'test3', isActive: true });

      const result = await repository.delete({ isActive: true });

      expect(result).toBe(3);
      const remaining = await repository.find({});
      expect(remaining).toHaveLength(0);
    });

    it('[REPO-D2050] should handle no matching documents', async () => {
      await TestModel.create({ name: 'test', isActive: true });

      const result = await repository.delete({ name: 'non-existent' });

      expect(result).toBe(0);
      const remaining = await repository.find({});
      expect(remaining).toHaveLength(1);
    });

    it('[REPO-D2060] should use shared query options', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', isActive: true });

      const spy = jest.spyOn(TestModel, 'deleteMany');
      await repository.delete({ _id: mockId });

      expect(spy).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          translateAliases: true,
          lean: expect.any(Object)
        })
      );
      spy.mockRestore();
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

  describe('softDeleteOne', () => {
    it('[REPO-D3010] should soft delete with simple filter', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', isActive: true });
      await TestModel.create({ name: 'test2', isActive: true });

      const result = await repository.softDeleteOne({ name: 'test' });

      expect(result).toBe(true);
      // Verify document is soft deleted
      const record = await repository.findById(mockId, { paranoid: false });
      expect(record!.deletedAt).toBeTruthy();
      // Verify other records remain unaffected
      const remaining = await repository.find({ isActive: true });
      expect(remaining).toHaveLength(1);
      expect(remaining[0].name).toBe('test2');
    });

    it('[REPO-D3020] should soft delete with ObjectId filter', async () => {
      const refId = createObjectId();
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', refId });
      await TestModel.create({ _id: mockId2, name: 'test2', refId });

      const result = await repository.softDeleteOne({ refId });

      expect(result).toBe(true);
      // Verify only one document was soft deleted
      const remaining = await repository.find({ refId });
      expect(remaining).toHaveLength(1);
      const deleted = await repository.find({ refId }, { paranoid: false });
      expect(deleted).toHaveLength(2);
      expect(deleted.filter(d => d.deletedAt)).toHaveLength(1);
    });

    it('[REPO-D3030] should soft delete with operator filter', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: true });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: true });

      const result = await repository.softDeleteOne({
        name: { $regex: /test\d/ },
        isActive: { $eq: true }
      });

      expect(result).toBe(true);
      // Verify only one document was soft deleted
      const remaining = await repository.find({ isActive: true });
      expect(remaining).toHaveLength(1);
      const deleted = await repository.find({ isActive: true }, { paranoid: false });
      expect(deleted).toHaveLength(2);
      expect(deleted.filter(d => d.deletedAt)).toHaveLength(1);
    });

    it('[REPO-D3040] should handle non-existent document', async () => {
      const result = await repository.softDeleteOne({ name: 'non-existent' });

      expect(result).toBe(false);
    });

    it('[REPO-D3050] should not soft delete already soft-deleted documents', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });

      const result = await repository.softDeleteOne({ _id: mockId });

      expect(result).toBe(false);
      // Verify document remains soft deleted with original timestamp
      const record = await repository.findById(mockId, { paranoid: false });
      expect(record!.deletedAt).toBeTruthy();
    });
  });

  describe('restore', () => {
    it('[REPO-R1010] should restore record by id', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });

      const result = await repository.restoreById(mockId);

      expect(result).toBe(true);
      const record = await repository.findById(mockId);
      expect(record).toBeTruthy();
      expect(record!.deletedAt).toBeNull();
    });

    it('[REPO-R1020] should restore multiple records', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: false, deletedAt: new Date() });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: false, deletedAt: new Date() });

      await repository.restore({ isActive: false });

      const records = await repository.find({ isActive: false });
      expect(records).toHaveLength(2);
      expect(records.every(r => r.deletedAt === null)).toBe(true);
    });

    it('[REPO-R1030] should restore with ObjectId filter', async () => {
      const refId = createObjectId();
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', refId, deletedAt: new Date() });
      await TestModel.create({ _id: mockId2, name: 'test2', refId, deletedAt: new Date() });
      await TestModel.create({ name: 'test3', deletedAt: new Date() });

      const result = await repository.restore({ refId });

      expect(result).toBe(2);
      // Verify restored documents
      const restored = await repository.find({ refId });
      expect(restored).toHaveLength(2);
      expect(restored.every(r => r.deletedAt === null)).toBe(true);
      // Verify other documents remain deleted
      const remaining = await repository.find({}, { paranoid: false });
      expect(remaining).toHaveLength(3);
      expect(remaining.filter(r => r.deletedAt !== null)).toHaveLength(1);
    });

    it('[REPO-R1040] should restore with operator filter', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: true, deletedAt: new Date() });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: true, deletedAt: new Date() });
      await TestModel.create({ name: 'test3', isActive: false, deletedAt: new Date() });

      const result = await repository.restore({
        name: { $regex: /test\d/ },
        isActive: { $eq: true }
      });

      expect(result).toBe(2);
      // Verify restored documents
      const restored = await repository.find({ isActive: true });
      expect(restored).toHaveLength(2);
      expect(restored.every(r => r.deletedAt === null)).toBe(true);
      // Verify other documents remain deleted
      const remaining = await repository.find({}, { paranoid: false });
      expect(remaining).toHaveLength(3);
      expect(remaining.filter(r => r.deletedAt !== null)).toHaveLength(1);
    });

    it('[REPO-R1050] should return correct restore count', async () => {
      const repository = new MongooseBaseRepository<ITestModel>(TestModel);
      await repository.create({ name: 'test1', isActive: true });
      await repository.create({ name: 'test2', isActive: true });
      await repository.create({ name: 'test3', isActive: true });
      await repository.softDelete({ isActive: true });

      const result = await repository.restore({ isActive: true });

      expect(result).toBe(3);
      const records = await repository.find({ isActive: true });
      expect(records).toHaveLength(3);
      expect(records.every(r => r.deletedAt === null)).toBe(true);
    });

    it('[REPO-R1060] should update non-deleted documents', async () => {
      const repository = new MongooseBaseRepository<ITestModel>(TestModel);
      await repository.create({ name: 'test1', isActive: true });

      const result = await repository.restore({ isActive: true });

      expect(result).toBe(1);
      const records = await repository.find({ isActive: true });
      expect(records).toHaveLength(1);
      expect(records.every(r => r.deletedAt === null)).toBe(true);
    });

    it('[REPO-R1070] should maintain document integrity', async () => {
      const mockId = createObjectId();
      const refId = createObjectId();
      const now = new Date();
      await TestModel.create({
        _id: mockId,
        name: 'test',
        refId,
        isActive: true,
        deletedAt: now
      });

      await repository.restore({ _id: mockId });

      const record = await repository.findById(mockId);
      expect(record).toBeTruthy();
      expect(record!.name).toBe('test');
      expect(record!.refId!.equals(refId)).toBe(true);
      expect(record!.isActive).toBe(true);
      expect(record!.deletedAt).toBeNull();
    });
  });

  describe('transformFilter', () => {
    it('[REPO-T0010] should handle plain objects with operators', () => {
      const filter = {
        field: { $eq: 'value' }
      };

      const result = (repository as any).transformFilter(filter);

      expect(result).toEqual({
        field: { $eq: 'value' }
      });
    });

    it('[REPO-T0020] should pass through non-plain objects', () => {
      class CustomClass {
        constructor(private value: string) { }
        toString() { return this.value; }
      }

      const customInstance = new CustomClass('test');
      const filter = {
        field: customInstance
      };

      const result = (repository as any).transformFilter(filter);

      expect(result.field).toBe(customInstance);
    });

    it('[REPO-T0030] should handle null and undefined values', () => {
      const filter = {
        field1: null,
        field2: undefined,
        field3: { $eq: null }
      };

      const result = (repository as any).transformFilter(filter);

      expect(result).toEqual({
        field1: null,
        field3: { $eq: null }
      });
    });
  });

  describe('transformOperators', () => {
    it('[REPO-T0040] should handle MongoDB operators', () => {
      const operators = {
        $eq: 'value',
        $gt: 5,
        $in: ['a', 'b']
      };

      const result = (repository as any).transformOperators(operators);

      expect(result).toEqual({
        $eq: 'value',
        $gt: 5,
        $in: ['a', 'b']
      });
    });

    it('[REPO-T0050] should pass through non-operator objects', () => {
      class CustomClass {
        constructor(private value: string) { }
        toString() { return this.value; }
      }

      const customInstance = new CustomClass('test');

      const result = (repository as any).transformOperators(customInstance);

      expect(result).toBe(customInstance);
    });

    it('[REPO-T0060] should handle mixed operator and non-operator fields', () => {
      const operators = {
        $eq: 'value',
        normalField: 'test'
      };

      const result = (repository as any).transformOperators(operators);

      expect(result).toEqual({
        $eq: 'value',
        normalField: 'test'
      });
    });
  });

  describe('count', () => {
    it('[REPO-C0020] should count records with filter', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test1', isActive: true });
      await TestModel.create({ name: 'test2', isActive: true });
      await TestModel.create({ name: 'test3', isActive: false });

      const result = await repository.count({ isActive: true });

      expect(result).toBe(2);
    });

    it('[REPO-C0030] should count records with ObjectId in filter', async () => {
      const refId = createObjectId();
      await TestModel.create({ name: 'test1', refId });
      await TestModel.create({ name: 'test2', refId });
      await TestModel.create({ name: 'test3' });

      const result = await repository.count({ refId });

      expect(result).toBe(2);
    });

    it('[REPO-C0040] should count records with operator filters', async () => {
      const refId = createObjectId();
      await TestModel.create({ name: 'test1', refId, isActive: true });
      await TestModel.create({ name: 'test2', refId, isActive: false });

      const result = await repository.count({
        refId,
        isActive: { $eq: true }
      });

      expect(result).toBe(1);
    });

    it('[REPO-C0050] should not count soft deleted records by default', async () => {
      await TestModel.create({ name: 'test1', isActive: true });
      await TestModel.create({ name: 'test2', isActive: true, deletedAt: new Date() });

      const result = await repository.count({ isActive: true });

      expect(result).toBe(1);
    });

    it('[REPO-C0060] should count soft deleted records with paranoid false', async () => {
      await TestModel.create({ name: 'test1', isActive: true });
      await TestModel.create({ name: 'test2', isActive: true, deletedAt: new Date() });

      const result = await repository.count({ isActive: true }, { paranoid: false });

      expect(result).toBe(2);
    });
  });

  describe('updateOne', () => {
    it('[REPO-U1010] should update single document', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', isActive: true });

      const result = await repository.updateOne(
        { _id: mockId },
        { name: 'updated' }
      );

      expect(result).toBeTruthy();
      expect(result!._id.equals(mockId)).toBe(true);
      expect(result!.name).toBe('updated');
      expect(result!.isActive).toBe(true);
    });

    it('[REPO-U1020] should update first match only', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: true });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: true });

      const result = await repository.updateOne(
        { isActive: true },
        { name: 'updated' }
      );

      expect(result).toBeTruthy();
      const records = await repository.find({ isActive: true });
      expect(records).toHaveLength(2);
      expect(records.some(r => r.name === 'updated')).toBe(true);
      expect(records.some(r => r.name === 'test2')).toBe(true);
    });

    it('[REPO-U1030] should return updated document', async () => {
      const mockId = createObjectId();
      const refId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', refId });

      const result = await repository.updateOne(
        { _id: mockId },
        { name: 'updated', isActive: true }
      );

      expect(result).toBeTruthy();
      expect(result!._id.equals(mockId)).toBe(true);
      expect(result!.name).toBe('updated');
      expect(result!.isActive).toBe(true);
      expect(result!.refId!.equals(refId)).toBe(true);
    });

    it('[REPO-U1040] should update with simple field filters', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', isActive: true });

      const result = await repository.updateOne(
        { name: 'test' },
        { name: 'updated' }
      );

      expect(result).toBeTruthy();
      expect(result!.name).toBe('updated');
    });

    it('[REPO-U1050] should update with ObjectId filters', async () => {
      const mockId = createObjectId();
      const refId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', refId });

      const result = await repository.updateOne(
        { refId },
        { name: 'updated' }
      );

      expect(result).toBeTruthy();
      expect(result!.name).toBe('updated');
      expect(result!.refId!.equals(refId)).toBe(true);
    });

    it('[REPO-U1060] should update with operator filters', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      const refId = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', refId, isActive: true });
      await TestModel.create({ _id: mockId2, name: 'test2', refId, isActive: false });

      const result = await repository.updateOne(
        { refId, isActive: { $eq: true } },
        { name: 'updated' }
      );

      expect(result).toBeTruthy();
      expect(result!.name).toBe('updated');
      expect(result!.isActive).toBe(true);
      
      // Verify only one document was updated
      const records = await repository.find({ refId });
      expect(records).toHaveLength(2);
      expect(records.filter(r => r.name === 'updated')).toHaveLength(1);
    });

    it('[REPO-U1070] should handle plain field updates', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', isActive: true });

      const result = await repository.updateOne(
        { _id: mockId },
        { name: 'updated', isActive: false }
      );

      expect(result).toBeTruthy();
      expect(result!.name).toBe('updated');
      expect(result!.isActive).toBe(false);
    });

    it('[REPO-U1080] should handle $set operator', async () => {
      const mockId = createObjectId();
      const refId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', refId });

      const update: UpdateQuery<ITestModel> = {
        $set: { name: 'updated', isActive: true }
      };

      const result = await repository.updateOne({ _id: mockId }, update);

      expect(result).toBeTruthy();
      expect(result!.name).toBe('updated');
      expect(result!.isActive).toBe(true);
      expect(result!.refId!.equals(refId)).toBe(true);
    });

    it('[REPO-U1090] should handle $unset operator', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', isActive: true });

      const update: UpdateQuery<ITestModel> = {
        $unset: { isActive: '' }
      };

      const result = await repository.updateOne({ _id: mockId }, update);

      expect(result).toBeTruthy();
      expect(result!.name).toBe('test');
      expect(result!.isActive).toBeUndefined();
    });

    it('[REPO-U1100] should return null for non-existent documents', async () => {
      const mockId = createObjectId();
      const result = await repository.updateOne(
        { _id: mockId },
        { name: 'updated' }
      );

      expect(result).toBeNull();
    });

    it('[REPO-U1110] should not update soft-deleted documents by default', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });

      const result = await repository.updateOne(
        { _id: mockId },
        { name: 'updated' }
      );

      expect(result).toBeNull();
      const record = await repository.findById(mockId, { paranoid: false });
      expect(record!.name).toBe('test');
    });

    it('[REPO-U1120] should update soft-deleted documents with paranoid false', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });

      const result = await repository.updateOne(
        { _id: mockId },
        { name: 'updated' },
        { paranoid: false }
      );

      expect(result).toBeTruthy();
      expect(result!.name).toBe('updated');
      expect(result!.deletedAt).toBeTruthy();
    });
  });

  describe('softDelete', () => {
    it('[REPO-D4010] should soft delete multiple documents', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: true });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: true });
      await TestModel.create({ name: 'test3', isActive: false });

      const result = await repository.softDelete({ isActive: true });

      expect(result).toBe(2);
      // Verify documents are soft deleted
      const remaining = await repository.find({ isActive: true });
      expect(remaining).toHaveLength(0);
      const deleted = await repository.find({ isActive: true }, { paranoid: false });
      expect(deleted).toHaveLength(2);
      expect(deleted.every(d => d.deletedAt)).toBe(true);
    });

    it('[REPO-D4020] should soft delete with ObjectId filter', async () => {
      const refId = createObjectId();
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', refId });
      await TestModel.create({ _id: mockId2, name: 'test2', refId });
      await TestModel.create({ name: 'test3' });

      const result = await repository.softDelete({ refId });

      expect(result).toBe(2);
      // Verify documents are soft deleted
      const remaining = await repository.find({ refId });
      expect(remaining).toHaveLength(0);
      const deleted = await repository.find({ refId }, { paranoid: false });
      expect(deleted).toHaveLength(2);
      expect(deleted.every(d => d.deletedAt)).toBe(true);
    });

    it('[REPO-D4030] should soft delete with operator filter', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: true });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: true });
      await TestModel.create({ name: 'test3', isActive: false });

      const result = await repository.softDelete({
        name: { $regex: /test\d/ },
        isActive: { $eq: true }
      });

      expect(result).toBe(2);
      // Verify documents are soft deleted
      const remaining = await repository.find({ isActive: true });
      expect(remaining).toHaveLength(0);
      const deleted = await repository.find({ isActive: true }, { paranoid: false });
      expect(deleted).toHaveLength(2);
      expect(deleted.every(d => d.deletedAt)).toBe(true);
    });

    it('[REPO-D4040] should return correct soft delete count', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test1', isActive: true });
      await TestModel.create({ _id: mockId2, name: 'test2', isActive: true });
      await TestModel.create({ name: 'test3', isActive: true });

      const result = await repository.softDelete({ isActive: true });

      expect(result).toBe(3);
      const remaining = await repository.find({ isActive: true });
      expect(remaining).toHaveLength(0);
    });

    it('[REPO-D4050] should handle no matching documents', async () => {
      await TestModel.create({ name: 'test', isActive: true });

      const result = await repository.softDelete({ name: 'non-existent' });

      expect(result).toBe(0);
      const remaining = await repository.find({});
      expect(remaining).toHaveLength(1);
    });

    it('[REPO-D4060] should not soft delete already soft-deleted documents', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      const now = new Date();
      await TestModel.create({ _id: mockId1, name: 'test1', deletedAt: now });
      await TestModel.create({ _id: mockId2, name: 'test2' });

      const result = await repository.softDelete({ name: { $regex: /test\d/ } });

      expect(result).toBe(1);
      // Verify only non-deleted document was affected
      const record1 = await repository.findById(mockId1, { paranoid: false });
      expect(record1!.deletedAt).toEqual(now);
      const record2 = await repository.findById(mockId2, { paranoid: false });
      expect(record2!.deletedAt).toBeTruthy();
      expect(record2!.deletedAt).not.toEqual(now);
    });
  });

  describe('pattern matching operators', () => {
    it('[REPO-T2010] should throw error when using $like operator', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test-1' });

      await expect(async () => {
        await repository.find({
          name: { $like: 'test-%' }
        });
      }).rejects.toThrow('Operator $like is not supported in MongoDB. Use $regex instead.');
    });

    it('[REPO-T2020] should verify error message guides to use $regex', async () => {
      const mockId = createObjectId();
      await TestModel.create({ _id: mockId, name: 'test-1' });

      await expect(async () => {
        await repository.find({
          name: { $like: 'test-%' }
        });
      }).rejects.toThrow(/\$regex/);
    });

    it('[REPO-T2030] should continue to support $regex operator', async () => {
      const mockId1 = createObjectId();
      const mockId2 = createObjectId();
      await TestModel.create({ _id: mockId1, name: 'test-1' });
      await TestModel.create({ _id: mockId2, name: 'test-2' });
      await TestModel.create({ _id: createObjectId(), name: 'other-3' });

      const results = await repository.find({
        name: { $regex: /^test-/ }
      });

      expect(results).toHaveLength(2);
      expect(results.map(r => r.name).sort()).toEqual(['test-1', 'test-2']);
    });
  });
});
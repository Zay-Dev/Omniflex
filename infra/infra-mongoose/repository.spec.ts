import { Schema, Types } from 'mongoose';

import { MongooseBaseRepository } from './repository';
import { createMockMongooseModel, createMockObjectId } from './test-utils/mongoose.mock';

interface ITestModel {
  _id: string;
  deletedAt?: Date;
  name: string;
  isActive?: boolean;
}

const TestSchema = new Schema<ITestModel>({
  deletedAt: { type: Date },
  name: { type: String },
  isActive: { type: Boolean },
}, {
  timestamps: true,
});

describe('MongooseBaseRepository', () => {
  let repository: MongooseBaseRepository<ITestModel>;
  let TestModel;

  beforeEach(() => {
    TestModel = createMockMongooseModel({}, TestSchema);
    repository = new MongooseBaseRepository(TestModel);
  });

  describe('exists', () => {
    it('[REPO-E0010] should check if record exists', async () => {
      const mockId = createMockObjectId();
      await TestModel.create({ _id: mockId, name: 'test' });

      const result = await repository.exists({ _id: mockId });

      expect(result).toBe(true);
      expect(TestModel.countDocuments).toHaveBeenCalledWith(
        { _id: mockId, deletedAt: null },
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
        },
      );
    });

    it('[REPO-E0020] should check if record exists with paranoid false', async () => {
      const mockId = createMockObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });

      const result = await repository.exists({ _id: mockId }, { paranoid: false });

      expect(result).toBe(true);
      expect(TestModel.countDocuments).toHaveBeenCalledWith(
        { _id: mockId },
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
        },
      );
    });
  });

  describe('findById', () => {
    it('[REPO-R0010] should find record by id', async () => {
      const mockId = createMockObjectId();
      await TestModel.create({ _id: mockId, name: 'test' });

      const result = await repository.findById(mockId);

      expect(result).toBeTruthy();
      expect(TestModel.findOne).toHaveBeenCalledWith(
        { _id: mockId, deletedAt: null },
        null,
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
        },
      );
    });

    it('[REPO-R0020] should not find soft deleted record', async () => {
      const mockId = createMockObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });

      const result = await repository.findById(mockId);

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('[REPO-R0030] should find one record with filter', async () => {
      const mockId = createMockObjectId();
      await TestModel.create({ _id: mockId, name: 'test' });

      const result = await repository.findOne({ name: 'test' });

      expect(result).toBeTruthy();
      expect(TestModel.findOne).toHaveBeenCalledWith(
        { name: 'test', deletedAt: null },
        null,
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
        },
      );
    });
  });

  describe('find', () => {
    it('[REPO-R0040] should find records with filter', async () => {
      const mockId = createMockObjectId();
      await TestModel.create({ _id: mockId, name: 'test', isActive: true });

      const result = await repository.find({ isActive: true });

      expect(result).toBeTruthy();
      expect(TestModel.find).toHaveBeenCalledWith(
        { isActive: true, deletedAt: null },
        null,
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
        },
      );
    });

    it('[REPO-R0050] should apply query options', async () => {
      const mockId = createMockObjectId();
      await TestModel.create({ _id: mockId, name: 'test' });

      await repository.find(
        { name: 'test' },
        { skip: 10, take: 20, sort: { name: 'desc' } },
      );

      expect(TestModel.find).toHaveBeenCalledWith(
        { name: 'test', deletedAt: null },
        null,
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
          skip: 10,
          limit: 20,
          sort: { name: 'desc' },
        },
      );
    });
  });

  describe('create', () => {
    it('[REPO-C0010] should create record', async () => {
      const mockId = createMockObjectId();
      const data = { _id: mockId, name: 'test' };

      await repository.create(data);

      expect(TestModel.create).toHaveBeenCalledWith(data);
    });
  });

  describe('updateById', () => {
    it('[REPO-U0010] should update record by id', async () => {
      const mockId = createMockObjectId();
      const model = await TestModel.create({ _id: mockId, name: 'test' });
      const update = { name: 'updated' };

      await repository.updateById(mockId, update);

      expect(TestModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockId, deletedAt: null },
        update,
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
          new: true,
        },
      );
    });
  });

  describe('update', () => {
    it('[REPO-U0020] should update multiple records', async () => {
      const filter = { isActive: true };
      const update = { name: 'updated' };

      await repository.update(filter, update);

      expect(TestModel.updateMany).toHaveBeenCalledWith(
        { isActive: true, deletedAt: null },
        update,
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
        },
      );
    });
  });

  describe('deleteById', () => {
    it('[REPO-D0010] should hard delete record by id', async () => {
      const mockId = createMockObjectId();
      const model = await TestModel.create({ _id: mockId, name: 'test' });

      const result = await repository.deleteById(mockId);

      expect(result).toBe(true);
      expect(TestModel.findOneAndDelete).toHaveBeenCalledWith(
        { _id: mockId },
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
        },
      );
    });
  });

  describe('deleteOne', () => {
    it('[REPO-D0020] should hard delete one record', async () => {
      const filter = { isActive: false };

      await repository.deleteOne(filter);

      expect(TestModel.findOneAndDelete).toHaveBeenCalledWith(
        { isActive: false },
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
        },
      );
    });
  });

  describe('delete', () => {
    it('[REPO-D0030] should hard delete multiple records', async () => {
      const filter = { isActive: false };

      await repository.delete(filter);

      expect(TestModel.deleteMany).toHaveBeenCalledWith(
        { isActive: false },
      );
    });
  });

  describe('softDeleteById', () => {
    it('[REPO-D0040] should soft delete record by id', async () => {
      const mockId = createMockObjectId();
      const model = await TestModel.create({ _id: mockId, name: 'test' });

      const result = await repository.softDeleteById(mockId);

      expect(result).toBe(true);
      expect(TestModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockId, deletedAt: null },
        { deletedAt: expect.any(Date) },
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
          new: true,
        },
      );
    });
  });

  describe('softDeleteOne', () => {
    it('[REPO-D0050] should soft delete one record', async () => {
      const filter = { isActive: false };

      await repository.softDeleteOne(filter);

      expect(TestModel.findOneAndUpdate).toHaveBeenCalledWith(
        { isActive: false, deletedAt: null },
        { deletedAt: expect.any(Date) },
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
          new: true,
        },
      );
    });
  });

  describe('softDelete', () => {
    it('[REPO-D0060] should soft delete multiple records', async () => {
      const filter = { isActive: false };

      await repository.softDelete(filter);

      expect(TestModel.updateMany).toHaveBeenCalledWith(
        { isActive: false, deletedAt: null },
        { deletedAt: expect.any(Date) },
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
        },
      );
    });
  });

  describe('restore', () => {
    it('[REPO-R0060] should restore multiple records', async () => {
      const filter = { isActive: false };

      await repository.restore(filter);

      expect(TestModel.updateMany).toHaveBeenCalledWith(
        { isActive: false },
        { deletedAt: null },
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
        },
      );
    });

    it('[REPO-R0070] should restore record by id', async () => {
      const mockId = createMockObjectId();
      await TestModel.create({ _id: mockId, name: 'test', deletedAt: new Date() });

      const result = await repository.restoreById(mockId);

      expect(result).toBe(true);
      expect(TestModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockId },
        { deletedAt: null },
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
          new: true,
        },
      );
    });

    it('[REPO-R0080] should restore one record with filter', async () => {
      const filter = { isActive: false };

      await repository.restoreOne(filter);

      expect(TestModel.findOneAndUpdate).toHaveBeenCalledWith(
        { isActive: false },
        { deletedAt: null },
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
          new: true,
        },
      );
    });
  });
}); 
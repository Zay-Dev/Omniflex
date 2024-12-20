import { Schema, Types } from 'mongoose';

import { MongooseBaseRepository } from '../repositories';
import { createMockMongooseModel } from './utils/mongoose.mock';

interface ITestModel {
  _id: string;
  deletedAt?: Date;
  identifier?: string;
  isVerified?: boolean;
}

const TestSchema = new Schema<ITestModel>({
  deletedAt: { type: Date },
  identifier: { type: String },
  isVerified: { type: Boolean },
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

  describe('delete', () => {
    it('should hard delete record successfully', async () => {
      const model = await TestModel.create({ _id: new Types.ObjectId().toString() });
      const result = await repository.delete(model._id);

      expect(result).toBe(true);
      expect(await repository.findById(model._id)).toBeNull();
    });

    it('should return false when record not found', async () => {
      const result = await repository.delete(new Types.ObjectId().toString());

      expect(result).toBe(false);
    });

    it('should hard delete soft-deleted record', async () => {
      const model = await TestModel.create({ _id: new Types.ObjectId().toString() });
      await repository.softDelete(model._id);

      const result = await repository.delete(model._id);

      expect(result).toBe(true);
      expect(await repository.findById(model._id)).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should soft delete record successfully', async () => {
      const model = await TestModel.create({ _id: new Types.ObjectId().toString() });
      const result = await repository.softDelete(model._id);

      expect(result).toBe(true);

      const softDeleted = await repository.findById(model._id, { paranoid: false });
      expect(softDeleted).toBeTruthy();
      expect(softDeleted?.deletedAt).toBeTruthy();

      const notFound = await repository.findById(model._id);
      expect(notFound).toBeNull();
    });

    it('should return false when record not found', async () => {
      const result = await repository.softDelete(new Types.ObjectId().toString());

      expect(result).toBe(false);
    });

    it('should return false when record already soft deleted', async () => {
      const model = await TestModel.create({ _id: new Types.ObjectId().toString() });
      await repository.softDelete(model._id);

      const result = await repository.softDelete(model._id);

      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('should find existing record', async () => {
      const model = await TestModel.create({ _id: new Types.ObjectId().toString() });
      const result = await repository.findById(model._id);

      expect(result).toBeTruthy();
      expect(`${result?._id}`).toBe(`${model._id}`);
    });

    it('should return null for non-existent record', async () => {
      const result = await repository.findById(new Types.ObjectId().toString());

      expect(result).toBeNull();
    });

    it('should not find soft-deleted record by default', async () => {
      const model = await TestModel.create({ _id: new Types.ObjectId().toString() });
      await repository.softDelete(model._id);

      const result = await repository.findById(model._id);

      expect(result).toBeNull();
    });

    it('should find soft-deleted record when paranoid is false', async () => {
      const model = await TestModel.create({ _id: new Types.ObjectId().toString() });
      await repository.softDelete(model._id);

      const result = await repository.findById(model._id, { paranoid: false });

      expect(result).toBeTruthy();
      expect(`${result?._id}`).toBe(`${model._id}`);
      expect(result?.deletedAt).toBeTruthy();
    });

    it('should not find hard-deleted record even with paranoid false', async () => {
      const model = await TestModel.create({ _id: new Types.ObjectId().toString() });
      await repository.delete(model._id);

      const result = await repository.findById(model._id, { paranoid: false });

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should apply lean options and translate aliases', async () => {
      const mockId = new Types.ObjectId().toString();
      const model = await TestModel.create({ _id: mockId, identifier: 'test' });
      const result = await repository.findOne({ _id: mockId });

      expect(TestModel.findOne).toHaveBeenCalledWith(
        { _id: mockId, deletedAt: null },
        null,
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true
        }
      );
      expect(result).toBeTruthy();
    });

    it('should handle query options with lean and translate aliases', async () => {
      const mockId = new Types.ObjectId().toString();
      await repository.findOne(
        { _id: mockId },
        { paranoid: false, skip: 1, take: 10, sort: { _id: 'desc' } }
      );

      expect(TestModel.findOne).toHaveBeenCalledWith(
        { _id: mockId },
        null,
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true,
          skip: 1,
          limit: 10,
          sort: { _id: 'desc' }
        }
      );
    });
  });

  describe('updateMany', () => {
    it('should update records with lean options', async () => {
      const mockId = new Types.ObjectId().toString();
      await repository.updateMany(
        { _id: mockId },
        { isVerified: true }
      );

      expect(TestModel.updateMany).toHaveBeenCalledWith(
        { _id: mockId, deletedAt: null },
        { isVerified: true },
        {
          lean: { defaults: true, getters: true, virtuals: true },
          translateAliases: true
        }
      );
    });
  });
});
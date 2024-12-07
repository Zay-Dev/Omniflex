import { Schema, connect, Types } from 'mongoose';

import { MongooseBaseRepository } from '../repositories';

interface ITestModel {
  _id: string;
  deletedAt?: Date;
}

const TestSchema = new Schema<ITestModel>({
  deletedAt: { type: Date },
}, {
  timestamps: true,
});

describe('MongooseBaseRepository', () => {
  let connection;
  let repository: MongooseBaseRepository<ITestModel>;
  let TestModel;

  beforeAll(async () => {
    connection = await connect('mongodb://192.168.1.230:27017/omniflex-unit-test');
    TestModel = connection.model('TestModel', TestSchema);
    repository = new MongooseBaseRepository(TestModel);
  });

  beforeEach(async () => {
    await TestModel.deleteMany({});
  });

  describe('delete', () => {
    it('should hard delete record successfully', async () => {
      const model = await TestModel.create({ _id: new Types.ObjectId().toString() });
      const result = await repository.delete(model._id);

      expect(result).toBe(true);
      expect(await TestModel.findById(model._id)).toBeNull();
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
      expect(await TestModel.findById(model._id)).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should soft delete record successfully', async () => {
      const model = await TestModel.create({ _id: new Types.ObjectId().toString() });
      const result = await repository.softDelete(model._id);

      expect(result).toBe(true);

      const softDeleted = await TestModel.findById(model._id);
      expect(softDeleted).not.toBeNull();
      expect(softDeleted?.deletedAt).not.toBeNull();

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

      expect(result).not.toBeNull();
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

      expect(result).not.toBeNull();
      expect(`${result?._id}`).toBe(`${model._id}`);
      expect(result?.deletedAt).not.toBeNull();
    });

    it('should not find hard-deleted record even with paranoid false', async () => {
      const model = await TestModel.create({ _id: new Types.ObjectId().toString() });
      await repository.delete(model._id);

      const result = await repository.findById(model._id, { paranoid: false });

      expect(result).toBeNull();
    });
  });
});
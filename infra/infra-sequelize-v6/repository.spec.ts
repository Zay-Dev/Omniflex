import { DataTypes, Model } from 'sequelize';
import { SequelizeRepository } from './repository';
import { createTestSequelize, setupTestDatabase, clearDatabase, closeDatabase, createTestModel } from './test-utils/sequelize.test-utils';

interface ITestModel {
  id: string;
  deletedAt?: Date;
  identifier?: string;
  isVerified?: boolean;
}

class TestModel extends Model<ITestModel> {
  declare id: string;
  declare deletedAt?: Date;
  declare identifier?: string;
  declare isVerified?: boolean;
}

describe('SequelizeRepository', () => {
  const sequelize = createTestSequelize();
  let repository: SequelizeRepository<ITestModel>;
  let model: typeof TestModel;

  beforeAll(async () => {
    model = createTestModel<TestModel>(sequelize, 'TestModel', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      identifier: DataTypes.STRING,
      isVerified: DataTypes.BOOLEAN
    });
    await setupTestDatabase(sequelize);
  });

  beforeEach(async () => {
    await clearDatabase(sequelize);
    repository = new SequelizeRepository(model);
  });

  afterAll(async () => {
    await closeDatabase(sequelize);
  });

  describe('findOne', () => {
    it('[REPO-R0010] should find record with raw option', async () => {
      const record = await model.create({ id: 'test-id', identifier: 'test' });
      const result = await repository.findOne({ id: record.id });

      expect(result).toBeTruthy();
      expect(result?.id).toBe(record.id);
    });

    it('[REPO-R0020] should handle query options with paranoid', async () => {
      const record = await model.create({ id: 'test-id', identifier: 'test' });
      const result = await repository.findOne(
        { id: record.id },
        { paranoid: false }
      );

      expect(result).toBeTruthy();
      expect(result?.id).toBe(record.id);
    });
  });

  describe('update', () => {
    it('[REPO-U0010] should update records with field-specific operations', async () => {
      const record = await model.create({ id: 'test-id', isVerified: false });
      await repository.update(
        { id: record.id },
        { isVerified: true }
      );

      const updated = await model.findByPk(record.id);
      expect(updated?.isVerified).toBe(true);
    });
  });

  describe('deleteById', () => {
    it('[REPO-D0010] should hard delete record successfully', async () => {
      const record = await model.create({ id: 'test-id' });
      const result = await repository.deleteById(record.id);

      expect(result).toBe(true);
      expect(await model.findByPk(record.id, { paranoid: false })).toBeNull();
    });

    it('[REPO-D0020] should return false when record not found', async () => {
      const result = await repository.deleteById('non-existent-id');
      expect(result).toBe(false);
    });

    it('[REPO-D0030] should hard delete soft-deleted record', async () => {
      const record = await model.create({ id: 'test-id' });
      await record.destroy();

      const result = await repository.deleteById(record.id);

      expect(result).toBe(true);
      expect(await model.findByPk(record.id, { paranoid: false })).toBeNull();
    });
  });

  describe('softDeleteById', () => {
    it('[REPO-A0010] should soft delete record successfully', async () => {
      const record = await model.create({ id: 'test-id' });
      const result = await repository.softDeleteById(record.id);

      expect(result).toBe(true);

      const softDeleted = await model.findByPk(record.id, { paranoid: false });
      expect(softDeleted).toBeTruthy();
      expect(softDeleted?.deletedAt).toBeTruthy();

      const notFound = await model.findByPk(record.id);
      expect(notFound).toBeNull();
    });

    it('[REPO-A0020] should return false when record not found', async () => {
      const result = await repository.softDeleteById('non-existent-id');
      expect(result).toBe(false);
    });

    it('[REPO-A0030] should return false when record already soft deleted', async () => {
      const record = await model.create({ id: 'test-id' });
      await record.destroy();

      const result = await repository.softDeleteById(record.id);
      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('[REPO-R0030] should find existing record', async () => {
      const record = await model.create({ id: 'test-id' });
      const result = await repository.findById(record.id);

      expect(result).toBeTruthy();
      expect(`${result?.id}`).toBe(`${record.id}`);
    });

    it('[REPO-R0040] should return null for non-existent record', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeNull();
    });

    it('[REPO-R0050] should not find soft-deleted record by default', async () => {
      const record = await model.create({ id: 'test-id' });
      await record.destroy();

      const result = await repository.findById(record.id);
      expect(result).toBeNull();
    });

    it('[REPO-R0060] should find soft-deleted record when paranoid is false', async () => {
      const record = await model.create({ id: 'test-id' });
      await record.destroy();

      const result = await repository.findById(record.id, { paranoid: false });

      expect(result).toBeTruthy();
      expect(`${result?.id}`).toBe(`${record.id}`);
      expect(result?.deletedAt).toBeTruthy();
    });

    it('[REPO-R0070] should not find hard-deleted record even with paranoid false', async () => {
      const record = await model.create({ id: 'test-id' });
      await repository.deleteById(record.id);

      const result = await repository.findById(record.id, { paranoid: false });
      expect(result).toBeNull();
    });
  });
}); 
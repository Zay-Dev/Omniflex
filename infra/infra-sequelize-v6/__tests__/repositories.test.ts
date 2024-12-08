import { DataTypes, Model, Sequelize } from 'sequelize';

import { SequelizeRepository } from '../repositories';

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
  let sequelize: Sequelize;
  let repository: SequelizeRepository<ITestModel>;

  beforeAll(async () => {
    sequelize = new Sequelize({
      logging: false,
      dialect: 'sqlite',
      storage: ':memory:',
    });

    TestModel.init({
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      identifier: {
        type: DataTypes.STRING
      },
      isVerified: {
        type: DataTypes.BOOLEAN
      }
    }, {
      sequelize,
      tableName: 'test_models',
      paranoid: true
    });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await TestModel.destroy({ where: {}, force: true });
    repository = new SequelizeRepository(TestModel);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('findOne', () => {
    it('should find record with raw option', async () => {
      const model = await TestModel.create({ id: 'test-id', identifier: 'test' });
      const result = await repository.findOne({ id: model.id });

      expect(result).toBeTruthy();
      expect(result?.id).toBe(model.id);
    });

    it('should handle query options with pagination and sort', async () => {
      const model = await TestModel.create({ id: 'test-id', identifier: 'test' });
      const result = await repository.findOne(
        { id: model.id },
        { paranoid: false, sort: { id: 'desc' } }
      );

      expect(result).toBeTruthy();
      expect(result?.id).toBe(model.id);
    });
  });

  describe('updateMany', () => {
    it('should update records with field-specific operations', async () => {
      const model = await TestModel.create({ id: 'test-id', isVerified: false });
      await repository.updateMany(
        { id: model.id },
        { isVerified: true }
      );

      const updated = await TestModel.findByPk(model.id);
      expect(updated?.isVerified).toBe(true);
    });
  });

  describe('delete', () => {
    it('should hard delete record successfully', async () => {
      const model = await TestModel.create({ id: 'test-id' });
      const result = await repository.delete(model.id);

      expect(result).toBe(true);
      expect(await TestModel.findByPk(model.id, { paranoid: false })).toBeNull();
    });

    it('should return false when record not found', async () => {
      const result = await repository.delete('non-existent-id');

      expect(result).toBe(false);
    });

    it('should hard delete soft-deleted record', async () => {
      const model = await TestModel.create({ id: 'test-id' });
      await model.destroy();

      const result = await repository.delete(model.id);

      expect(result).toBe(true);
      expect(await TestModel.findByPk(model.id, { paranoid: false })).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should soft delete record successfully', async () => {
      const model = await TestModel.create({ id: 'test-id' });
      const result = await repository.softDelete(model.id);

      expect(result).toBe(true);

      const softDeleted = await TestModel.findByPk(model.id, { paranoid: false });
      expect(softDeleted).toBeTruthy();
      expect(softDeleted?.deletedAt).toBeTruthy();

      const notFound = await TestModel.findByPk(model.id);
      expect(notFound).toBeNull();
    });

    it('should return false when record not found', async () => {
      const result = await repository.softDelete('non-existent-id');

      expect(result).toBe(false);
    });

    it('should return false when record already soft deleted', async () => {
      const model = await TestModel.create({ id: 'test-id' });
      await model.destroy();

      const result = await repository.softDelete(model.id);

      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('should find existing record', async () => {
      const model = await TestModel.create({ id: 'test-id' });
      const result = await repository.findById(model.id);

      expect(result).toBeTruthy();
      expect(`${result?.id}`).toBe(`${model.id}`);
    });

    it('should return null for non-existent record', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should not find soft-deleted record by default', async () => {
      const model = await TestModel.create({ id: 'test-id' });
      await model.destroy();

      const result = await repository.findById(model.id);

      expect(result).toBeNull();
    });

    it('should find soft-deleted record when paranoid is false', async () => {
      const model = await TestModel.create({ id: 'test-id' });
      await model.destroy();

      const result = await repository.findById(model.id, { paranoid: false });

      expect(result).toBeTruthy();
      expect(`${result?.id}`).toBe(`${model.id}`);
      expect(result?.deletedAt).toBeTruthy();
    });

    it('should not find hard-deleted record even with paranoid false', async () => {
      const model = await TestModel.create({ id: 'test-id' });
      await repository.delete(model.id);

      const result = await repository.findById(model.id, { paranoid: false });

      expect(result).toBeNull();
    });
  });
});
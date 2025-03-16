import { DataTypes, Model } from 'sequelize'
import { SequelizeRepository } from '../../repository'
import { createTestSequelize, setupTestDatabase, clearDatabase, closeDatabase, createTestModel } from '../../test-utils/sequelize.test-utils'

interface ITestModel {
  id: string
  deletedAt?: Date
  identifier?: string
  isVerified?: boolean
}

class TestModel extends Model<ITestModel> {
  declare id: string
  declare deletedAt?: Date
  declare identifier?: string
  declare isVerified?: boolean
}

describe('SequelizeRepository', () => {
  const sequelize = createTestSequelize()
  let repository: SequelizeRepository<ITestModel>
  let model: typeof TestModel

  beforeAll(async () => {
    model = createTestModel<TestModel>(sequelize, 'TestModel', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      identifier: DataTypes.STRING,
      isVerified: DataTypes.BOOLEAN
    })
    await setupTestDatabase(sequelize)
  })

  beforeEach(async () => {
    await clearDatabase(sequelize)
    repository = new SequelizeRepository(model)
  })

  afterAll(async () => {
    await closeDatabase(sequelize)
  })

  describe('create', () => {
    it('[REPO-C0010] should create record with all fields', async () => {
      const data = {
        id: 'test-id',
        identifier: 'test-identifier',
        isVerified: true
      }

      const result = await repository.create(data)

      expect(result).toBeTruthy()
      expect(result.id).toBe(data.id)
      expect(result.identifier).toBe(data.identifier)
      expect(result.isVerified).toBe(data.isVerified)
    })

    it('[REPO-C0020] should create record with only required fields', async () => {
      const data = {
        id: 'test-id'
      }

      const result = await repository.create(data)

      expect(result).toBeTruthy()
      expect(result.id).toBe(data.id)
      expect(result.identifier).toBeFalsy()
      expect(result.isVerified).toBeFalsy()
    })

    it('[REPO-C0030] should throw error when creating record with duplicate id', async () => {
      const data = {
        id: 'test-id'
      }

      await repository.create(data)
      await expect(repository.create(data)).rejects.toThrow()
    })
  })

  describe('findOne', () => {
    it('[REPO-R0010] should find record with raw option', async () => {
      const record = await model.create({ id: 'test-id', identifier: 'test' })
      const result = await repository.findOne({ id: record.id })

      expect(result).toBeTruthy()
      expect(result?.id).toBe(record.id)
    })

    it('[REPO-R0020] should handle query options with paranoid', async () => {
      const record = await model.create({ id: 'test-id', identifier: 'test' })
      const result = await repository.findOne(
        { id: record.id },
        { paranoid: false }
      )

      expect(result).toBeTruthy()
      expect(result?.id).toBe(record.id)
    })
  })

  describe('update', () => {
    it('[REPO-U0010] should update records with field-specific operations', async () => {
      const record = await model.create({ id: 'test-id', isVerified: false })
      await repository.update(
        { id: record.id },
        { isVerified: true }
      )

      const updated = await model.findByPk(record.id)
      expect(updated?.isVerified).toBe(true)
    })
  })

  describe('deleteById', () => {
    it('[REPO-D0010] should hard delete record successfully', async () => {
      const record = await model.create({ id: 'test-id' })
      const result = await repository.deleteById(record.id)

      expect(result).toBe(true)
      expect(await model.findByPk(record.id, { paranoid: false })).toBeNull()
    })

    it('[REPO-D0020] should return false when record not found', async () => {
      const result = await repository.deleteById('non-existent-id')
      expect(result).toBe(false)
    })

    it('[REPO-D0030] should hard delete soft-deleted record', async () => {
      const record = await model.create({ id: 'test-id' })
      await record.destroy()

      const result = await repository.deleteById(record.id)

      expect(result).toBe(true)
      expect(await model.findByPk(record.id, { paranoid: false })).toBeNull()
    })
  })

  describe('softDeleteById', () => {
    it('[REPO-A0010] should soft delete record successfully', async () => {
      const record = await model.create({ id: 'test-id' })
      const result = await repository.softDeleteById(record.id)

      expect(result).toBe(true)

      const softDeleted = await model.findByPk(record.id, { paranoid: false })
      expect(softDeleted).toBeTruthy()
      expect(softDeleted?.deletedAt).toBeTruthy()

      const notFound = await model.findByPk(record.id)
      expect(notFound).toBeNull()
    })

    it('[REPO-A0020] should return false when record not found', async () => {
      const result = await repository.softDeleteById('non-existent-id')
      expect(result).toBe(false)
    })

    it('[REPO-A0030] should return false when record already soft deleted', async () => {
      const record = await model.create({ id: 'test-id' })
      await record.destroy()

      const result = await repository.softDeleteById(record.id)
      expect(result).toBe(false)
    })
  })

  describe('findById', () => {
    it('[REPO-R0030] should find existing record', async () => {
      const record = await model.create({ id: 'test-id' })
      const result = await repository.findById(record.id)

      expect(result).toBeTruthy()
      expect(`${result?.id}`).toBe(`${record.id}`)
    })

    it('[REPO-R0040] should return null for non-existent record', async () => {
      const result = await repository.findById('non-existent-id')
      expect(result).toBeNull()
    })

    it('[REPO-R0050] should not find soft-deleted record by default', async () => {
      const record = await model.create({ id: 'test-id' })
      await record.destroy()

      const result = await repository.findById(record.id)
      expect(result).toBeNull()
    })

    it('[REPO-R0060] should find soft-deleted record when paranoid is false', async () => {
      const record = await model.create({ id: 'test-id' })
      await record.destroy()

      const result = await repository.findById(record.id, { paranoid: false })

      expect(result).toBeTruthy()
      expect(`${result?.id}`).toBe(`${record.id}`)
      expect(result?.deletedAt).toBeTruthy()
    })

    it('[REPO-R0070] should not find hard-deleted record even with paranoid false', async () => {
      const record = await model.create({ id: 'test-id' })
      await repository.deleteById(record.id)

      const result = await repository.findById(record.id, { paranoid: false })
      expect(result).toBeNull()
    })
  })

  describe('exists', () => {
    it('[REPO-E0010] should return true when record exists', async () => {
      const record = await model.create({ id: 'test-id' })
      const result = await repository.exists({ id: record.id })

      expect(result).toBe(true)
    })

    it('[REPO-E0020] should return false when record does not exist', async () => {
      const result = await repository.exists({ id: 'non-existent-id' })

      expect(result).toBe(false)
    })

    it('[REPO-E0030] should respect paranoid option for soft-deleted records', async () => {
      const record = await model.create({ id: 'test-id' })
      await record.destroy()

      const defaultResult = await repository.exists({ id: record.id })
      expect(defaultResult).toBe(false)

      const nonParanoidResult = await repository.exists(
        { id: record.id },
        { paranoid: false }
      )
      expect(nonParanoidResult).toBe(true)
    })
  })

  describe('find', () => {
    it('[REPO-R1010] should find multiple records with basic filter', async () => {
      const records = await Promise.all([
        model.create({ id: 'test-1', identifier: 'test' }),
        model.create({ id: 'test-2', identifier: 'test' }),
        model.create({ id: 'other', identifier: 'other' })
      ])

      const results = await repository.find({ identifier: 'test' })

      expect(Array.isArray(results)).toBe(true)
      expect(results).toHaveLength(2)
      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'test-1' }),
          expect.objectContaining({ id: 'test-2' })
        ])
      )
    })

    it('[REPO-R1020] should return empty array when no records match', async () => {
      await model.create({ id: 'test-1', identifier: 'test' })

      const results = await repository.find({ identifier: 'non-existent' })

      expect(Array.isArray(results)).toBe(true)
      expect(results).toHaveLength(0)
    })

    it('[REPO-R1030] should find records with complex filter conditions', async () => {
      await Promise.all([
        model.create({ id: 'test-1', identifier: 'test', isVerified: true }),
        model.create({ id: 'test-2', identifier: 'test', isVerified: false }),
        model.create({ id: 'test-3', identifier: 'other', isVerified: true })
      ])

      const results = await repository.find({
        identifier: 'test',
        isVerified: true
      })

      expect(results).toHaveLength(1)
      expect(results[0]).toMatchObject({
        id: 'test-1',
        identifier: 'test',
        isVerified: true
      })
    })

    it('[REPO-R1040] should handle paranoid mode for multiple records', async () => {
      const records = await Promise.all([
        model.create({ id: 'test-1', identifier: 'test' }),
        model.create({ id: 'test-2', identifier: 'test' }),
        model.create({ id: 'test-3', identifier: 'test' })
      ])

      await records[1].destroy()

      const defaultResults = await repository.find({ identifier: 'test' })
      expect(defaultResults).toHaveLength(2)
      expect(defaultResults).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'test-1' }),
          expect.objectContaining({ id: 'test-3' })
        ])
      )

      const nonParanoidResults = await repository.find(
        { identifier: 'test' },
        { paranoid: false }
      )
      expect(nonParanoidResults).toHaveLength(3)
      expect(nonParanoidResults).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'test-1' }),
          expect.objectContaining({ id: 'test-2' }),
          expect.objectContaining({ id: 'test-3' })
        ])
      )
    })

    it('[REPO-R1050] should find records with partial field match', async () => {
      await repository.create({ identifier: 'test-1', isVerified: true });
      await repository.create({ identifier: 'test-2', isVerified: false });
      await repository.create({ identifier: 'other-1', isVerified: true });

      const results = await repository.find({
        identifier: { $like: 'test-%' }
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(2);
      expect(results.every(r => (r.identifier as string).startsWith('test-'))).toBe(true);
    });

    it('[REPO-R1060] should find records with array of values', async () => {
      await Promise.all([
        model.create({ id: 'test-1', identifier: 'value-1' }),
        model.create({ id: 'test-2', identifier: 'value-2' }),
        model.create({ id: 'test-3', identifier: 'value-3' })
      ])

      const results = await repository.find({
        identifier: { $in: ['value-1', 'value-3'] }
      })

      expect(results).toHaveLength(2)
      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'test-1' }),
          expect.objectContaining({ id: 'test-3' })
        ])
      )
    })
  })

  describe('pattern matching', () => {
    it('[REPO-T1010] should transform $like operator to Sequelize Op.like', async () => {
      await repository.create({ id: 'test-1', identifier: 'test-value-1' });
      await repository.create({ id: 'test-2', identifier: 'test-value-2' });

      const results = await repository.find({ identifier: { $like: 'test-value-%' } });
      expect(results).toHaveLength(2);
      expect(results.map(r => r.identifier)).toEqual(['test-value-1', 'test-value-2']);
    });

    it('[REPO-T1020] should validate $like pattern is a string', async () => {
      await expect(repository.find({ 
        identifier: { $like: {} as any } 
      })).rejects.toThrow('Invalid $like pattern: pattern must be a string');
    });

    it('[REPO-T1030] should handle multiple conditions with $like', async () => {
      await repository.create({ id: 'test-1', identifier: 'abc-123' });
      await repository.create({ id: 'test-2', identifier: 'abc-456' });
      await repository.create({ id: 'test-3', identifier: 'xyz-123' });

      const results = await repository.find({
        identifier: { 
          $like: 'abc-%',
        }
      });

      expect(results).toHaveLength(2);
      expect(results.map(r => r.identifier).sort()).toEqual(['abc-123', 'abc-456']);
    });

    it('[REPO-T1040] should reject invalid operator', async () => {
      await expect(repository.find({
        identifier: { $invalid: 'value' } as any
      })).rejects.toThrow('Unsupported operator: $invalid');
    });

    it('[REPO-T1050] should validate operator format', async () => {
      await expect(repository.find({
        identifier: null as any
      })).rejects.toThrow('Invalid operator format: operators must be an object');
    });
  });

  describe('count', () => {
    it('[REPO-C1010] should count records with basic filter', async () => {
      await Promise.all([
        repository.create({ id: 'test-1', identifier: 'test' }),
        repository.create({ id: 'test-2', identifier: 'test' }),
        repository.create({ id: 'other-1', identifier: 'other' })
      ]);

      const count = await repository.count({ identifier: 'test' });
      expect(count).toBe(2);
    });

    it('[REPO-C1020] should count records with operator filter', async () => {
      await Promise.all([
        repository.create({ id: 'test-1', identifier: 'value-1' }),
        repository.create({ id: 'test-2', identifier: 'value-2' }),
        repository.create({ id: 'test-3', identifier: 'other' })
      ]);

      const count = await repository.count({
        identifier: { $in: ['value-1', 'value-2'] }
      });
      expect(count).toBe(2);
    });

    it('[REPO-C1030] should respect paranoid mode', async () => {
      await Promise.all([
        repository.create({ id: 'test-1', identifier: 'test' }),
        repository.create({ id: 'test-2', identifier: 'test' }),
        repository.create({ id: 'test-3', identifier: 'test' })
      ]);

      await repository.softDeleteById('test-2');

      const defaultCount = await repository.count({ identifier: 'test' });
      expect(defaultCount).toBe(2);

      const nonParanoidCount = await repository.count(
        { identifier: 'test' },
        { paranoid: false }
      );
      expect(nonParanoidCount).toBe(3);
    });

    it('[REPO-C1040] should handle complex conditions', async () => {
      await Promise.all([
        repository.create({ id: 'test-1', identifier: 'test', isVerified: true }),
        repository.create({ id: 'test-2', identifier: 'test', isVerified: false }),
        repository.create({ id: 'test-3', identifier: 'test', isVerified: true })
      ]);

      const count = await repository.count({
        identifier: 'test',
        isVerified: true
      });
      expect(count).toBe(2);
    });

    it('[REPO-C1050] should handle pattern matching in count', async () => {
      await Promise.all([
        repository.create({ id: 'test-1', identifier: 'abc-123' }),
        repository.create({ id: 'test-2', identifier: 'abc-456' }),
        repository.create({ id: 'test-3', identifier: 'xyz-789' })
      ]);

      const count = await repository.count({
        identifier: { $like: 'abc-%' }
      });
      expect(count).toBe(2);
    });
  });

  describe('updateOne', () => {
    it('[REPO-U1010] should update single record with basic filter', async () => {
      await Promise.all([
        repository.create({ id: 'test-1', identifier: 'test', isVerified: false }),
        repository.create({ id: 'test-2', identifier: 'test', isVerified: false })
      ]);

      const updated = await repository.updateOne(
        { identifier: 'test' },
        { isVerified: true }
      );

      expect(updated).toBeTruthy();
      expect(updated?.isVerified).toBe(true);

      const count = await repository.count({ isVerified: true });
      expect(count).toBe(1);
    });

    it('[REPO-U1020] should update using operator filter', async () => {
      await Promise.all([
        repository.create({ id: 'test-1', identifier: 'value-1', isVerified: false }),
        repository.create({ id: 'test-2', identifier: 'value-2', isVerified: false })
      ]);

      const updated = await repository.updateOne(
        { identifier: { $like: 'value-%' } },
        { isVerified: true }
      );

      expect(updated).toBeTruthy();
      expect(updated?.isVerified).toBe(true);
      expect(updated?.identifier).toMatch(/^value-/);

      const count = await repository.count({ isVerified: true });
      expect(count).toBe(1);
    });

    it('[REPO-U1030] should respect paranoid mode', async () => {
      const [record1, record2] = await Promise.all([
        repository.create({ id: 'test-1', identifier: 'test', isVerified: false }),
        repository.create({ id: 'test-2', identifier: 'test', isVerified: false })
      ]);

      await repository.softDeleteById(record1.id);

      const initialFind = await repository.findOne({ id: record1.id }, { paranoid: false });
      expect(initialFind?.id).toBe('test-1');
      expect(initialFind?.deletedAt).toBeTruthy();

      const defaultUpdate = await repository.updateOne(
        { identifier: 'test' },
        { isVerified: true }
      );
      expect(defaultUpdate?.id).toBe('test-2');

      const paranoidUpdate = await repository.updateOne(
        { id: 'test-1' },
        { isVerified: true },
        { paranoid: false }
      );
      expect(paranoidUpdate?.id).toBe('test-1');
      expect(paranoidUpdate?.isVerified).toBe(true);
    });

    it('[REPO-U1040] should return null when no records match', async () => {
      const updated = await repository.updateOne(
        { identifier: 'non-existent' },
        { isVerified: true }
      );

      expect(updated).toBeNull();
    });

    it('[REPO-U1050] should handle complex conditions', async () => {
      await Promise.all([
        repository.create({ id: 'test-1', identifier: 'test', isVerified: false }),
        repository.create({ id: 'test-2', identifier: 'test', isVerified: true }),
        repository.create({ id: 'test-3', identifier: 'other', isVerified: false })
      ]);

      const updated = await repository.updateOne(
        { id: 'test-1', isVerified: false },
        { identifier: 'updated' }
      );

      expect(updated).toBeTruthy();
      expect(updated?.identifier).toBe('updated');
      expect(updated?.isVerified).toBe(false);

      const count = await repository.count({ identifier: 'updated' });
      expect(count).toBe(1);
    });
  });

  describe('delete', () => {
    it('[REPO-D2010] should delete multiple records with basic filter', async () => {
      await Promise.all([
        repository.create({ id: 'test-1', identifier: 'test' }),
        repository.create({ id: 'test-2', identifier: 'test' }),
        repository.create({ id: 'other-1', identifier: 'other' })
      ]);

      const deleteCount = await repository.delete({ identifier: 'test' });
      expect(deleteCount).toBe(2);

      const remaining = await repository.find({}, { paranoid: false });
      expect(remaining).toHaveLength(1);
      expect(remaining[0].identifier).toBe('other');
    });

    it('[REPO-D2020] should delete using operator filter', async () => {
      await Promise.all([
        repository.create({ id: 'test-1', identifier: 'value-1' }),
        repository.create({ id: 'test-2', identifier: 'value-2' }),
        repository.create({ id: 'test-3', identifier: 'other' })
      ]);

      const deleteCount = await repository.delete({
        identifier: { $like: 'value-%' }
      });
      expect(deleteCount).toBe(2);

      const remaining = await repository.find({}, { paranoid: false });
      expect(remaining).toHaveLength(1);
      expect(remaining[0].identifier).toBe('other');
    });

    it('[REPO-D2030] should handle complex conditions', async () => {
      await Promise.all([
        repository.create({ id: 'test-1', identifier: 'test', isVerified: true }),
        repository.create({ id: 'test-2', identifier: 'test', isVerified: false }),
        repository.create({ id: 'test-3', identifier: 'test', isVerified: true })
      ]);

      const deleteCount = await repository.delete({
        identifier: 'test',
        isVerified: true
      });
      expect(deleteCount).toBe(2);

      const remaining = await repository.find({}, { paranoid: false });
      expect(remaining).toHaveLength(1);
      expect(remaining[0].isVerified).toBe(false);
    });

    it('[REPO-D2040] should return 0 when no records match', async () => {
      await repository.create({ id: 'test-1', identifier: 'test' });

      const deleteCount = await repository.delete({
        identifier: 'non-existent'
      });
      expect(deleteCount).toBe(0);

      const remaining = await repository.find({}, { paranoid: false });
      expect(remaining).toHaveLength(1);
    });

    it('[REPO-D2050] should bypass soft-deleted records', async () => {
      const records = await Promise.all([
        repository.create({ id: 'test-1', identifier: 'test' }),
        repository.create({ id: 'test-2', identifier: 'test' }),
        repository.create({ id: 'test-3', identifier: 'test' })
      ]);

      // Soft delete one record
      await repository.softDeleteById(records[1].id);

      // Hard delete should affect all records (including soft-deleted)
      const deleteCount = await repository.delete({ identifier: 'test' });
      expect(deleteCount).toBe(3);

      // Verify no records exist (even with paranoid false)
      const remaining = await repository.find({}, { paranoid: false });
      expect(remaining).toHaveLength(0);
    });
  });
}) 
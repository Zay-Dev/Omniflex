import { DataTypes, Model, Sequelize } from 'sequelize'
import { createTestSequelize } from '../test-utils/sequelize.test-utils'
import { SequelizeRepository } from '../repository'

describe('SequelizeRepository', () => {
  describe('paranoid mode', () => {
    let sequelize: Sequelize
    let repository: SequelizeRepository<TestModel & { id: number }, number>

    class TestModel extends Model {
      declare id: number;
      declare name: string;
    }

    beforeAll(async () => {
      sequelize = createTestSequelize()
      await sequelize.authenticate()

      TestModel.init(
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          name: {
            type: DataTypes.STRING
          }
        },
        {
          sequelize,
          paranoid: true,
          modelName: 'TestModel'
        }
      )

      await sequelize.sync({ force: true })
      repository = new SequelizeRepository(TestModel)
    })

    afterAll(async () => {
      await sequelize.close()
    })

    beforeEach(async () => {
      await repository.delete({})
    })

    it('[REPO-Q0020] should return non-deleted records by default', async () => {
      // Arrange
      const testRecord = await repository.create({ name: 'test' })
      expect(testRecord).toBeDefined()

      // Act
      const result = await repository.find({})

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('test')
    })

    it('[REPO-Q0030] should not return soft-deleted records by default', async () => {
      // Arrange
      const testRecord = await repository.create({ name: 'test' })
      expect(testRecord).toBeDefined()
      await repository.softDelete({ id: testRecord.id })

      // Act
      const result = await repository.find({})

      // Assert
      expect(result).toHaveLength(0)
    })

    it('[REPO-Q0040] should return soft-deleted records when paranoid is false', async () => {
      // Arrange
      const testRecord = await repository.create({ name: 'test' })
      expect(testRecord).toBeDefined()
      await repository.softDelete({ id: testRecord.id })

      // Act
      const result = await repository.find({}, { paranoid: false })

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('test')
    })

    it('[REPO-Q0050] supports explicit deletedAt queries (not recommended)', async () => {
      // Arrange
      const testRecord = await repository.create({ name: 'test' })
      expect(testRecord).toBeDefined()

      // Act - Note: This pattern works but is not recommended
      // Use default paranoid behavior instead
      const result = await repository.find({
        deletedAt: { $eq: null }
      } as any)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('test')
    })
  })
})
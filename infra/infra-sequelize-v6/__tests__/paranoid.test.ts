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

    it('[REPO-Q0010] should not return records when explicitly querying deletedAt: null', async () => {
      // Arrange
      const testRecord = await repository.create({ name: 'test' })
      expect(testRecord).toBeDefined()

      // Act
      const result = await repository.find({
        deletedAt: null
      } as any)

      // Assert
      expect(result).toHaveLength(0)
    })

    it('[REPO-Q0020] should return records when not explicitly querying deletedAt', async () => {
      // Arrange
      const testRecord = await repository.create({ name: 'test' })
      expect(testRecord).toBeDefined()

      // Act
      const result = await repository.find({})

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('test')
    })

    it('[REPO-Q0030] should not return soft-deleted records with either query method', async () => {
      // Arrange
      const testRecord = await repository.create({ name: 'test' })
      expect(testRecord).toBeDefined()
      await repository.softDelete({ id: testRecord.id })

      // Act
      const resultWithNull = await repository.find({
        deletedAt: null
      } as any)
      const resultWithoutNull = await repository.find({})

      // Assert
      expect(resultWithNull).toHaveLength(0)
      expect(resultWithoutNull).toHaveLength(0)
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
  })
})
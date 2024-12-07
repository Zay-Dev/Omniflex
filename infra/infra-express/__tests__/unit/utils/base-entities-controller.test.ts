import { Model, DataTypes, Sequelize, ModelStatic, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { BaseEntitiesController } from '@omniflex/infra-express/utils/base-entities-controller';
import { SQLiteRepository } from '@omniflex/infra-sqlite';

interface TestEntity {
  id: string;
  name: string;
  isDeleted: boolean;
}

class TestModel extends Model<InferAttributes<TestModel>, InferCreationAttributes<TestModel>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare isDeleted: CreationOptional<boolean>;

  toJSON(): TestEntity {
    return {
      id: this.id,
      name: this.name,
      isDeleted: this.isDeleted ?? false
    };
  }
}

type TestController = BaseEntitiesController<TestEntity, string>;
const TestController = BaseEntitiesController<TestEntity, string>;

describe('BaseEntitiesController', () => {
  const createTestModel = async (name: string) => TestModel.create({ name });
  const createMockReq = (params = {}, body = {}, query = {}) => ({
    params,
    body,
    query,
    headers: {},
    path: '',
    method: '',
    url: ''
  });
  const createMockRes = () => ({
    locals: {},
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  });

  let sequelize: Sequelize;
  let controller: TestController;
  let repository: SQLiteRepository<TestEntity, string>;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeAll(async () => {
    sequelize = new Sequelize('sqlite::memory:', { logging: false });

    TestModel.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'test',
      timestamps: false
    });

    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await TestModel.destroy({ where: {}, truncate: true });
    req = createMockReq();
    res = createMockRes();
    next = jest.fn();
    repository = new SQLiteRepository<TestEntity, string>(TestModel as unknown as ModelStatic<Model<TestEntity>>);
    controller = new TestController(req, res, next, repository);
  });

  afterAll(() => sequelize.close());

  describe('initialization', () => {
    it('should throw error if repository is not provided', () => {
      expect(() => new TestController(req, res, next, null as any))
        .toThrow('repository is required');
    });
  });

  describe('read operations', () => {
    describe('tryGetOne', () => {
      it('should return entity if found', async () => {
        const entity = await createTestModel('test');
        req.params.id = entity.id;

        await controller.tryGetOne();

        expect(res.json).toHaveBeenCalledWith({
          data: expect.objectContaining({ id: entity.id, name: 'test' })
        });
      });

      it('should throw not found if entity does not exist', async () => {
        req.params.id = '123e4567-e89b-12d3-a456-426614174000';
        await controller.tryGetOne();
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Not Found') }));
      });
    });

    describe('list operations', () => {
      it('should return all entities for tryListAll', async () => {
        const entities = await Promise.all([
          createTestModel('test1'),
          createTestModel('test2')
        ]);

        await controller.tryListAll();

        expect(res.json).toHaveBeenCalledWith({
          data: expect.arrayContaining(entities.map(e => expect.objectContaining({ id: e.id }))),
          total: 2
        });
      });

      it('should handle pagination in tryListPaginated', async () => {
        await Promise.all([
          createTestModel('test1'),
          createTestModel('test2'),
          createTestModel('test3')
        ]);

        req.query = { page: '1', pageSize: '2' };
        await controller.tryListPaginated();

        expect(res.json).toHaveBeenCalledWith({
          data: expect.arrayContaining([
            expect.objectContaining({ name: 'test1' }),
            expect.objectContaining({ name: 'test2' })
          ]),
          total: 2
        });
      });
    });
  });

  describe('write operations', () => {
    describe('tryCreate', () => {
      it('should create and return new entity', async () => {
        req.body = { name: 'test' };
        await controller.tryCreate();

        expect(res.json).toHaveBeenCalledWith({
          data: expect.objectContaining({ name: 'test' })
        });
      });

      it('should handle creation failure', async () => {
        jest.spyOn(repository, 'create').mockRejectedValueOnce(new Error('Creation failed'));
        req.body = { name: 'test' };

        await controller.tryCreate();
        expect(next).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    describe('modification operations', () => {
      it('should update entity successfully', async () => {
        const entity = await createTestModel('test');
        req.params.id = entity.id;
        req.body = { name: 'updated' };

        await controller.tryUpdate();

        expect(res.json).toHaveBeenCalledWith({
          data: expect.objectContaining({ id: entity.id, name: 'updated' })
        });
      });

      it('should handle soft delete', async () => {
        const entity = await createTestModel('test');
        req.params.id = entity.id;

        await controller.trySoftDelete();

        expect(res.json).toHaveBeenCalledWith({ data: { success: true } });
        const softDeleted = await repository.findById(entity.id);
        expect(softDeleted?.isDeleted).toBe(true);
      });

      it('should handle hard delete', async () => {
        const entity = await createTestModel('test');
        req.params.id = entity.id;

        await controller.tryDelete();

        expect(res.json).toHaveBeenCalledWith({ data: { success: true } });
        const deleted = await repository.findById(entity.id);
        expect(deleted).toBeNull();
      });
    });
  });
});
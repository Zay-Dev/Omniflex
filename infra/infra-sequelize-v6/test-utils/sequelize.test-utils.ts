import { Sequelize, Model, ModelStatic } from 'sequelize';

export const createTestSequelize = (): Sequelize => {
  return new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
};

export const clearDatabase = async (sequelize: Sequelize): Promise<void> => {
  for (const model of Object.values(sequelize.models)) {
    try {
      await model.destroy({
        where: {},
        force: true,
        truncate: true,
      });
    } catch (error) {
      console.error(`Failed to clear model ${model.name}:`, error);
    }
  }
};

export const closeDatabase = async (sequelize: Sequelize): Promise<void> => {
  await sequelize.close();
};

export const setupTestDatabase = async (sequelize: Sequelize): Promise<void> => {
  await sequelize.sync({ force: true });
};

export const createTestModel = <T extends Model>(sequelize: Sequelize, modelName: string, attributes: any, options: any = {}): ModelStatic<T> => {
  const model = sequelize.define<T>(modelName, attributes, {
    ...options,
    timestamps: true,
    paranoid: true,
  });
  return model as ModelStatic<T>;
};
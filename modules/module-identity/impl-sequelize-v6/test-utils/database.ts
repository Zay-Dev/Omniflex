import { Sequelize } from 'sequelize';

// Order matters: child tables must be cleared before parent tables
const CHILD_TABLES = ['UserPasswords', 'UserProfiles', 'LoginAttempts'];
const PARENT_TABLES = ['Users'];

export const clearModuleDatabase = async (sequelize: Sequelize): Promise<void> => {
  try {
    // Delete child tables first
    for (const tableName of CHILD_TABLES) {
      const model = sequelize.models[tableName];
      if (model) {
        try {
          await model.destroy({
            where: {},
            force: true,
          });
        } catch (error) {
          console.error(`Failed to clear model ${model.name}:`, error);
          throw error; // Re-throw to stop the process
        }
      }
    }

    // Then delete parent tables
    for (const tableName of PARENT_TABLES) {
      const model = sequelize.models[tableName];
      if (model) {
        try {
          await model.destroy({
            where: {},
            force: true,
          });
        } catch (error) {
          console.error(`Failed to clear model ${model.name}:`, error);
          throw error; // Re-throw to stop the process
        }
      }
    }
  } catch (error) {
    console.error('Failed to clear database:', error);
    throw error;
  }
}; 
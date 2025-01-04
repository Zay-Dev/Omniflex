export default {
  transform: {},
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/../jest.setup.ts'],

  testMatch: [
    // Unit tests co-located with source files
    '**/*.spec.ts',
    // Integration tests in __tests__ directory
    '**/__tests__/**/*.test.ts',
    // User requirement specs in __tests__ directory
    '**/__tests__/**/*.spec.ts',
  ],

  moduleNameMapper: {
    '^@omniflex/core$': '<rootDir>/core',
    '^@omniflex/core/(.*)$': '<rootDir>/core/$1',
    '^@omniflex/infra-express/?(.*)$': '<rootDir>/infra/infra-express/$1',
    '^@omniflex/infra-sqlite/?(.*)$': '<rootDir>/infra/infra-sqlite/$1',
    '^@omniflex/infra-postgres/?(.*)$': '<rootDir>/infra/infra-postgres/$1',
    '^@omniflex/infra-mongoose/?(.*)$': '<rootDir>/infra/infra-mongoose/$1',
    '^@omniflex/infra-sequelize-v6/?(.*)$': '<rootDir>/infra/infra-sequelize-v6/$1',

    '^@omniflex/module-user-session-core/?(.*)$': '<rootDir>/modules/module-user-session/core/$1',
    '^@omniflex/module-user-session-express/?(.*)$': '<rootDir>/modules/module-user-session/impl-express/$1',
    '^@omniflex/module-user-session-mongoose/?(.*)$': '<rootDir>/modules/module-user-session/impl-mongoose/$1',
    '^@omniflex/module-user-session-sequelize-v6/?(.*)$': '<rootDir>/modules/module-user-session/impl-sequelize-v6/$1',

    '^@omniflex/module-identity-core/?(.*)$': '<rootDir>/modules/module-identity/core/$1',
    '^@omniflex/module-identity-express/?(.*)$': '<rootDir>/modules/module-identity/impl-express/$1',
    '^@omniflex/module-identity-mongoose/?(.*)$': '<rootDir>/modules/module-identity/impl-mongoose/$1',
    '^@omniflex/module-identity-sequelize-v6/?(.*)$': '<rootDir>/modules/module-identity/impl-sequelize-v6/$1',
  },

  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  modulePathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
};
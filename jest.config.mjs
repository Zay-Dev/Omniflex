export default {
  transform: {},
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageReporters: ['text', 'text-summary'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  testMatch: [
    '**/__tests__/**/*\.(spec|test)\.[jt]s?(x)',
  ],

  moduleNameMapper: {
    '^@omniflex/core$': '<rootDir>/core',
    '^@omniflex/core/(.*)$': '<rootDir>/core/$1',
    '^@omniflex/infra-express/?(.*)$': '<rootDir>/infra/infra-express/$1',
    '^@omniflex/infra-sqlite/?(.*)$': '<rootDir>/infra/infra-sqlite/$1',
    '^@omniflex/infra-postgres/?(.*)$': '<rootDir>/infra/infra-postgres/$1',
    '^@omniflex/infra-mongoose/?(.*)$': '<rootDir>/infra/infra-mongoose/$1',
    '^@omniflex/infra-sequelize-v6/?(.*)$': '<rootDir>/infra/infra-sequelize-v6/$1',
    '^@/(.*)$': '<rootDir>/apps/server/$1',

    '^@omniflex/module-user-session-core/?(.*)$': '<rootDir>/modules/module-user-session/core/$1',
    '^@omniflex/module-user-session-impl-express/?(.*)$': '<rootDir>/modules/module-user-session/impl-express/$1',
    '^@omniflex/module-user-session-impl-mongoose/?(.*)$': '<rootDir>/modules/module-user-session/impl-mongoose/$1',
    '^@omniflex/module-user-session-impl-sequelize-v6/?(.*)$': '<rootDir>/modules/module-user-session/impl-sequelize-v6/$1',

    '^@omniflex/module-identity-core/?(.*)$': '<rootDir>/modules/module-identity/core/$1',
    '^@omniflex/module-identity-impl-express/?(.*)$': '<rootDir>/modules/module-identity/impl-express/$1',
    '^@omniflex/module-identity-impl-mongoose/?(.*)$': '<rootDir>/modules/module-identity/impl-mongoose/$1',
    '^@omniflex/module-identity-impl-sequelize-v6/?(.*)$': '<rootDir>/modules/module-identity/impl-sequelize-v6/$1',
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
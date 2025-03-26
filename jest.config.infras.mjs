export default {
  transform: {},
  preset: 'ts-jest',
  testEnvironment: 'node',

  reporters: ["jest-silent-reporter"],
  coverageReporters: ['text', 'text-summary'],

  testMatch: [
    '**/*\.(spec)\.[jt]s',
    '**/__tests__/**/*\.(spec)\.[jt]s',
  ],

  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  modulePathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
};
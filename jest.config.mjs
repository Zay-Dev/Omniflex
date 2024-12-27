export default {
  coverageReporters: ['text', 'text-summary'],

  testMatch: [
    '**/__tests__/**/*\.(spec|test)\.[jt]s?(x)',
  ],

  projects: [
    '<rootDir>/core/**/jest.config.mjs',
    '<rootDir>/infra/**/jest.config.mjs',
    '<rootDir>/modules/**/jest.config.mjs',
    '<rootDir>/apps/**/jest.config.mjs',
  ]
};
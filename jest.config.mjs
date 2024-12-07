export default {
  transform: {},
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
};
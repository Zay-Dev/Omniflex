import baseConfig from '../../jest.config.base.mjs';

const moduleNameMapper = Object.fromEntries(Object.entries(baseConfig.moduleNameMapper));

for (const key in moduleNameMapper) {
  const value = moduleNameMapper[key];

  if (key.startsWith('^@omniflex/')) {
    moduleNameMapper[key] = value.replace('<rootDir>/', '<rootDir>/../../');
  }
}

export default {
  ...baseConfig,
  moduleNameMapper,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}; 
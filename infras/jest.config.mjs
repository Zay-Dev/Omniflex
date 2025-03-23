import config from '../jest.config.infras.mjs';

const transform = {
  ...(config.transform || {}),

  '^.+\\.[jt]s$': [
    'ts-jest',
    {
      tsconfig: 'tsconfig.infras.json',
    },
  ],
};

config.transform = transform;

config.moduleNameMapper = {
  '^@omni-infra/core': '<rootDir>/core',
  '^@omni-infra/core/(.*)$': '<rootDir>/core/$1',
};

export default config;
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

export default config;
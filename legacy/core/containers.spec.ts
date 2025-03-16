import { TBaseConfig } from './types/config';
import { mockLogger } from './jest.setup';
import { AwilixContainer } from 'awilix';

describe('Container Management', () => {
  let containerModule: typeof import('./containers');

  beforeEach(() => {
    // Run each test in isolation with its own module registry
    jest.isolateModules(() => {
      containerModule = require('./containers');
    });
  });

  describe('asValue', () => {
    it('[CONTAINER-C0010] should register a new value', () => {
      // Arrange
      const key = 'testKey';
      const value = 'testValue';

      // Act
      containerModule.asValue(key, value);

      // Assert
      expect(containerModule.appContainer.resolve(key)).toBe(value);
    });

    it('[CONTAINER-C0020] should not override existing value by default', () => {
      // Arrange
      const key = 'testKey';
      const originalValue = 'original';
      const newValue = 'new';

      // Act
      containerModule.asValue(key, originalValue);
      containerModule.asValue(key, newValue);

      // Assert
      expect(containerModule.appContainer.resolve(key)).toBe(originalValue);
    });

    it('[CONTAINER-C0030] should override value when override is true', () => {
      // Arrange
      const key = 'testKey';
      const originalValue = 'original';
      const newValue = 'new';

      // Act
      containerModule.asValue(key, originalValue);
      containerModule.asValue(key, newValue, { override: true });

      // Assert
      expect(containerModule.appContainer.resolve(key)).toBe(newValue);
    });
  });

  describe('asValues', () => {
    it('[CONTAINER-C0040] should register multiple values', () => {
      // Arrange
      const services = {
        key1: 'value1',
        key2: 'value2',
      };

      // Act
      containerModule.asValues(services);

      // Assert
      expect(containerModule.appContainer.resolve('key1')).toBe('value1');
      expect(containerModule.appContainer.resolve('key2')).toBe('value2');
    });

    it('[CONTAINER-C0045] should override existing values', () => {
      // Arrange
      const key = 'testKey';
      const originalValue = 'original';
      const newValue = 'new';

      // Act
      containerModule.asValue(key, originalValue);
      containerModule.asValues({ [key]: newValue });

      // Assert
      expect(containerModule.appContainer.resolve(key)).toBe(newValue);
    });
  });

  describe('configAs', () => {
    it('[CONTAINER-C0050] should return default config when not registered', () => {
      // Act
      const config = containerModule.configAs();

      // Assert
      expect(config).toEqual({
        env: 'production',
        logging: {
          level: 'silly',
          exposeErrorDetails: false,
        },
        server: {
          requestTimeoutInSeconds: 30,
        },
      });
    });

    it('[CONTAINER-C0060] should return registered config', () => {
      // Arrange
      const customConfig: TBaseConfig = {
        env: 'development',
        logging: {
          level: 'debug',
          exposeErrorDetails: true,
        },
        server: {
          requestTimeoutInSeconds: 60,
        },
      };
      containerModule.asValue('config', customConfig);

      // Act
      const config = containerModule.configAs();

      // Assert
      expect(config).toEqual(customConfig);
    });
  });

  describe('appContainerAs', () => {
    it('[CONTAINER-C0070] should return typed container', () => {
      // Arrange
      interface ICustomContainer {
        customService: string;
      }
      containerModule.asValue('customService', 'test');

      // Act
      const container = containerModule.appContainerAs<ICustomContainer>();

      // Assert
      expect(container.resolve('customService')).toBe('test');
    });

    it('[CONTAINER-C0080] should maintain base container types', () => {
      // Arrange
      containerModule.asValue('logger', mockLogger);

      // Act
      const container = containerModule.appContainerAs();

      // Assert
      expect(container.resolve('logger')).toBe(mockLogger);
    });
  });
}); 
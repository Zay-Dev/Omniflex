import { Express, Router } from 'express';
import { logger, handleUncaughtException } from '@omniflex/core';
import { AutoServer } from './auto-server';
import { createServer, runExpress } from './run-express';
import { TServer, THydratedRouter } from './types';

jest.mock('@omniflex/core', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  handleUncaughtException: jest.fn(),
}));

jest.mock('./run-express', () => {
  const createMockExpressServer = () => ({
    request: {},
    response: {},
    init: jest.fn(),
    defaultConfiguration: jest.fn(),
    use: jest.fn(),
    listen: jest.fn(),
  } as unknown as Express);

  const mockServer = createMockExpressServer();
  return {
    createServer: jest.fn().mockReturnValue(mockServer),
    runExpress: jest.fn().mockReturnValue(Promise.resolve([{
      app: mockServer,
      type: 'test',
      server: 'server-instance',
    }])),
  };
});

describe('AutoServer', () => {
  let autoServer: typeof AutoServer;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.isolateModules(() => {
      autoServer = require('./auto-server').AutoServer;
    });
  });

  describe('addServer', () => {
    it('[SERVER-C0010] should add a server successfully', () => {
      // Arrange
      const server = {
        type: 'test',
        port: 3000,
      };

      // Act
      autoServer.addServer(server);

      // Assert
      expect(() => autoServer.getOrCreateRouter('test', '/api')).not.toThrow();
    });

    it('[SERVER-C0020] should throw error when adding duplicate server type', () => {
      // Arrange
      const server = {
        type: 'test',
        port: 3000,
      };

      // Act
      autoServer.addServer(server);

      // Assert
      expect(() => autoServer.addServer(server)).toThrow('Server type test already exists');
    });
  });

  describe('getOrCreateRouter', () => {
    it('[SERVER-R0010] should create router if not exists', () => {
      // Arrange
      const server = {
        type: 'test',
        port: 3000,
      };
      autoServer.addServer(server);

      // Act
      const router = autoServer.getOrCreateRouter('test', '/api');

      // Assert
      expect(router).toBeTruthy();
    });

    it('[SERVER-R0020] should return existing router', () => {
      // Arrange
      const server = {
        type: 'test',
        port: 3000,
      };
      autoServer.addServer(server);

      // Act
      const router1 = autoServer.getOrCreateRouter('test', '/api');
      const router2 = autoServer.getOrCreateRouter('test', '/api');

      // Assert
      expect(router1).toBe(router2);
    });

    it('[SERVER-R0030] should throw error when server does not exist', () => {
      // Act & Assert
      expect(() => autoServer.getOrCreateRouter('test', '/api'))
        .toThrow('Server type test does not exist');
    });
  });

  describe('start', () => {
    it('[SERVER-S0010] should start servers successfully', async () => {
      // Arrange
      const server = {
        type: 'test',
        port: 3000,
      };
      autoServer.addServer(server);

      // Act
      const result = await autoServer.start();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('test');
      expect(result[0].server).toBe('server-instance');
    });

    it('[SERVER-S0020] should log warning when no routers defined', async () => {
      // Arrange
      const server = {
        type: 'test',
        port: 3000,
      };
      autoServer.addServer(server);

      // Act
      await autoServer.start();

      // Assert
      expect(logger.warn).toHaveBeenCalledWith('No router is defined', {
        tags: 'test',
      });
    });

    it('[SERVER-S0030] should log debug when routers defined', async () => {
      // Arrange
      const server = {
        type: 'test',
        port: 3000,
      };
      autoServer.addServer(server);
      autoServer.getOrCreateRouter('test', '/api');
      autoServer.getOrCreateRouter('test', '/users');

      // Act
      await autoServer.start();

      // Assert
      expect(logger.debug).toHaveBeenCalledWith('/api, /users', {
        tags: 'test',
      });
    });
  });
}); 
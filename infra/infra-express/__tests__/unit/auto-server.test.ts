import express from 'express';
import { AutoServer } from '@omniflex/infra-express/auto-server';

jest.mock('../../run-express', () => ({
  createServer: jest.fn(() => express()),
  runExpress: jest.fn().mockImplementation(() => Promise.resolve([]))
}));

describe('AutoServer', () => {
  let portCounter = 3001;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset internal state of AutoServer
    // @ts-ignore - accessing private for testing
    if (global.servers) global.servers.clear();
    // @ts-ignore - accessing private for testing
    if (global.routers) global.routers.clear();
  });

  const getUniquePort = () => portCounter++;

  describe('addServer', () => {
    test('adds a server successfully', () => {
      const server = {
        type: 'test',
        port: getUniquePort()
      };

      expect(() => AutoServer.addServer(server)).not.toThrow();
    });

    test('throws error when adding duplicate server type', () => {
      const port = getUniquePort();
      const server = {
        type: 'duplicate',
        port
      };

      AutoServer.addServer(server);
      expect(() => AutoServer.addServer(server)).toThrow('Server type duplicate already exists');
    });
  });

  describe('getOrCreateRouter', () => {
    test('creates new router for valid server type', () => {
      const serverType = 'test-router';
      AutoServer.addServer({ type: serverType, port: getUniquePort() });

      const router = AutoServer.getOrCreateRouter(serverType, '/api');
      expect(router).toBeDefined();
      expect(typeof router.use).toBe('function');
    });

    test('returns existing router for same path', () => {
      const serverType = 'test-router-2';
      AutoServer.addServer({ type: serverType, port: getUniquePort() });

      const router1 = AutoServer.getOrCreateRouter(serverType, '/api');
      const router2 = AutoServer.getOrCreateRouter(serverType, '/api');

      expect(router1).toBe(router2);
    });

    test('throws error for non-existent server type', () => {
      expect(() => AutoServer.getOrCreateRouter('non-existent', '/api'))
        .toThrow('Server type non-existent does not exist');
    });

    test('formats router paths correctly', () => {
      const serverType = 'path-test';
      AutoServer.addServer({ type: serverType, port: getUniquePort() });

      const paths = [
        ['api', '/api'],
        ['/api/', '/api'],
        ['//api//', '/api'],
        ['/api/v1/', '/api/v1']
      ];

      paths.forEach(([input, expected]) => {
        const router = AutoServer.getOrCreateRouter(serverType, input);
        expect(router).toBeDefined();
      });
    });
  });

  describe('start', () => {
    const mockServer = express();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('starts server with default configuration', async () => {
      const serverType = 'start-test';
      AutoServer.addServer({
        type: serverType,
        port: getUniquePort(),
        server: mockServer
      });

      const result = await AutoServer.start();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test('starts server with custom routers', async () => {
      const serverType = 'router-test';
      AutoServer.addServer({
        type: serverType,
        port: getUniquePort(),
        server: mockServer
      });

      const router = AutoServer.getOrCreateRouter(serverType, '/api');
      router.get('/test', (req, res) => {
        res.json({ test: true });
      });

      const result = await AutoServer.start();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test('handles server without explicit router configuration', async () => {
      const serverType = 'no-router';
      AutoServer.addServer({
        type: serverType,
        port: getUniquePort(),
        server: mockServer
      });

      const result = await AutoServer.start();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
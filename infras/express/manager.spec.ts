import '@omni-infra/core';

import * as Manager from './manager';
import * as Routers from './routers';

jest.mock('express', () => ({
  Router: jest.fn().mockReturnValue({
    use: jest.fn(),
    // Mock other router methods
  }),
}));

jest.mock('./routers', () => ({
  getHydrated: jest.fn().mockReturnValue({
    use: jest.fn(),
    // Mock other router methods
  }),
}));

describe('Express/Manager', () => {
  let mockGetLoggerDebug: jest.SpyInstance;
  let mockGetLoggerWarn: jest.SpyInstance;
  let mockGetThrowable: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLoggerDebug = jest.spyOn(globalThis.logger, 'debug').mockImplementation();
    mockGetLoggerWarn = jest.spyOn(globalThis.logger, 'warn').mockImplementation();
    mockGetThrowable = jest.spyOn(globalThis, 'getThrowable').mockImplementation(msg => new Error(msg));
  });

  afterEach(() => {
    mockGetLoggerDebug.mockRestore();
    mockGetLoggerWarn.mockRestore();
    mockGetThrowable.mockRestore();
  });

  describe('initialize', () => {
    it('[Express/Manager-0010] should initialize manager with provided server types', () => {
      const manager = Manager.initialize(['admin', 'public']);

      expect(manager).toBeDefined();
      expect(typeof manager.getRouter).toBe('function');
      expect(typeof manager.getOrCreateRouter).toBe('function');
    });

    it('[Express/Manager-0020] should throw error for non-existent server type', () => {
      const manager = Manager.initialize(['admin']);

      expect(() => {
        manager.getRouter('non-existent' as any);
      }).toThrow("Server type 'non-existent' does not exist");
    });
  });

  describe('getRouter', () => {
    it('[Express/Manager-0030] should get router for valid server type', () => {
      const manager = Manager.initialize(['admin']);
      const router = manager.getRouter('admin');

      expect(router).toBeDefined();
    });

    it('[Express/Manager-0040] should log paths when retrieving router', () => {
      const manager = Manager.initialize(['admin']);

      // Add a route to populate paths
      manager.getOrCreateRouter('admin', '/test');

      manager.getRouter('admin');

      expect(mockGetLoggerDebug).toHaveBeenCalled();
      expect(mockGetLoggerDebug.mock.calls[0][0]).toContain('[admin]');
      expect(mockGetLoggerDebug.mock.calls[0][0]).toContain('/test');
    });

    it('[Express/Manager-0050] should skip path printing when skipPathsPrint is true', () => {
      const manager = Manager.initialize(['admin']);

      // Add a route to populate paths
      manager.getOrCreateRouter('admin', '/test');

      manager.getRouter('admin', { skipPathsPrint: true });

      expect(mockGetLoggerDebug).not.toHaveBeenCalled();
    });

    it('[Express/Manager-0060] should warn when no routers are defined', () => {
      const manager = Manager.initialize(['admin']);

      manager.getRouter('admin');

      expect(mockGetLoggerWarn).toHaveBeenCalled();
      expect(mockGetLoggerWarn.mock.calls[0][0]).toContain("No routers are defined for server type 'admin'");
    });

    it('[Express/Manager-0070] should throw error when no routers are defined and throwEmptyRouters is true', () => {
      const manager = Manager.initialize(['admin']);

      expect(() => {
        manager.getRouter('admin', { throwEmptyRouters: true });
      }).toThrow("No routers are defined for server type 'admin'");

      expect(mockGetThrowable).toHaveBeenCalled();
    });
  });

  describe('getOrCreateRouter', () => {
    it('[Express/Manager-0080] should create new router for path', () => {
      const manager = Manager.initialize(['admin']);

      const router = manager.getOrCreateRouter('admin', '/test');

      expect(router).toBeDefined();
      expect(Routers.getHydrated).toHaveBeenCalled();
    });

    it('[Express/Manager-0090] should normalize path with leading and trailing slashes', () => {
      const manager = Manager.initialize(['admin']);

      const router1 = manager.getOrCreateRouter('admin', 'test');
      const router2 = manager.getOrCreateRouter('admin', '/test/');

      // Should return the same router for normalized paths
      expect(router1).toBe(router2);
    });

    it('[Express/Manager-0100] should return existing router for path', () => {
      const manager = Manager.initialize(['admin']);

      const router1 = manager.getOrCreateRouter('admin', '/test');

      // Reset the mock to verify it's not called again
      (Routers.getHydrated as jest.Mock).mockClear();

      const router2 = manager.getOrCreateRouter('admin', '/test');

      expect(router1).toBe(router2);
      expect(Routers.getHydrated).not.toHaveBeenCalled();
    });

    it('[Express/Manager-0110] should normalize multiple slashes in path', () => {
      const manager = Manager.initialize(['admin']);

      const router1 = manager.getOrCreateRouter('admin', '/test');
      const router2 = manager.getOrCreateRouter('admin', '//test//');

      // Should return the same router for normalized paths
      expect(router1).toBe(router2);
    });
  });
});
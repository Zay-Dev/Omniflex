import { Express, Router } from 'express'
import { logger } from '@omniflex/core'
import supertest from 'supertest'
import { TServer } from '../../types'

describe('Server Integration Tests', () => {
  let servers: Array<{ app: Express; type: string; server: any }>
  let AutoServer: typeof import('../../auto-server').AutoServer
  const activeServers = new Set<any>()
  let errorSpy: jest.SpyInstance
  
  beforeEach(async () => {
    // Ensure clean state
    await cleanupServers()
    
    // Each test gets its own module instance with fresh global state
    jest.isolateModules(() => {
      // Setup error spy first inside the isolated module
      const { logger } = require('@omniflex/core')
      errorSpy = jest.spyOn(logger, 'error')
      errorSpy.mockClear()
      
      const module = require('../../auto-server')
      AutoServer = module.AutoServer
    })
  })

  afterEach(async () => {
    // Cleanup after each test
    await cleanupServers()
    // Restore spy
    errorSpy.mockRestore()
  })

  async function cleanupServers() {
    // Close all active servers
    for (const server of activeServers) {
      if (server && server.close) {
        await new Promise((resolve) => server.close(resolve))
      }
    }
    activeServers.clear()
  }

  function createTestRouter(handler: (req: any, res: any) => void): Router {
    const router = Router()
    router.get('/', handler)
    return router
  }

  describe('Server Lifecycle', () => {
    it('[EXPR-I0010] should start multiple servers with different configurations', async () => {
      const exposedServer: Omit<TServer, 'server'> = {
        type: 'exposed',
        port: 3500,
        getRouters: () => ({
          '/test': createTestRouter((_req, res) => res.json({ status: 'ok' }))
        })
      }

      const internalServer: Omit<TServer, 'server'> = {
        type: 'internal',
        port: 3501,
        getRouters: () => ({
          '/health': createTestRouter((_req, res) => res.json({ status: 'healthy' }))
        })
      }

      AutoServer.addServer(exposedServer)
      AutoServer.addServer(internalServer)

      servers = await AutoServer.start()
      servers.forEach(s => s.server && activeServers.add(s.server))
      
      expect(servers).toHaveLength(2)
      expect(servers[0].type).toBe('exposed')
      expect(servers[1].type).toBe('internal')

      // Test exposed server endpoint
      const exposedResponse = await supertest(servers[0].app)
        .get('/test')
        .expect(200)
      expect(exposedResponse.body).toEqual({ status: 'ok' })

      // Test internal server endpoint
      const internalResponse = await supertest(servers[1].app)
        .get('/health')
        .expect(200)
      expect(internalResponse.body).toEqual({ status: 'healthy' })
    })

    it('[EXPR-I0020] should handle invalid server configuration with proper error logging', async () => {
      const invalidServer: Omit<TServer, 'server'> = {
        type: 'invalid',
        port: 0, // Invalid port
        getRouters: () => ({})
      }

      AutoServer.addServer(invalidServer)
      servers = await AutoServer.start()
      servers.forEach(s => s.server && activeServers.add(s.server))

      // Verify error is logged
      expect(errorSpy).toHaveBeenCalledWith(
        'Cannot start server: invalid port (received 0)',
        { tags: 'invalid' }
      )

      // Server should exist in array but server instance should be null
      expect(servers).toHaveLength(1)
      expect(servers[0].type).toBe('invalid')
      expect(servers[0].server).toBeNull()

      // Cleanup should work even with null servers
      await cleanupServers()
      expect(activeServers.size).toBe(0)
    })

    it('[EXPR-I0031] should register and handle routes via getRouters', async () => {
      const testServer: Omit<TServer, 'server'> = {
        type: 'test',
        port: 3502,
        getRouters: () => ({
          '/test': createTestRouter((_req, res) => res.json({ status: 'ok' }))
        })
      }

      AutoServer.addServer(testServer)
      servers = await AutoServer.start()
      servers.forEach(s => s.server && activeServers.add(s.server))

      const testServerInstance = servers.find(s => s.type === 'test')
      expect(testServerInstance).toBeTruthy()

      const response = await supertest(testServerInstance!.app)
        .get('/test')
        .expect(200)

      expect(response.body).toEqual({ status: 'ok' })
    })

    it('[EXPR-I0032] should execute route middleware in correct order', async () => {
      const routeLog: string[] = []
      const testServer: Omit<TServer, 'server'> = {
        type: 'test',
        port: 3502,
        getRouters: () => ({
          '/test': (() => {
            const router = Router()
            router.use((_req, _res, next) => {
              routeLog.push('route-before')
              next()
            })
            router.get('/', (_req, res) => {
              routeLog.push('handler')
              res.json({ log: routeLog })
            })
            return router
          })()
        })
      }

      AutoServer.addServer(testServer)
      servers = await AutoServer.start()
      servers.forEach(s => s.server && activeServers.add(s.server))

      const testServerInstance = servers.find(s => s.type === 'test')
      expect(testServerInstance).toBeTruthy()

      await supertest(testServerInstance!.app)
        .get('/test')
        .expect(200)

      expect(routeLog).toEqual(['route-before', 'handler'])
    })

    it('[EXPR-I0033] should execute before middleware chain correctly', async () => {
      const requestLog: string[] = []
      const testServer: Omit<TServer, 'server'> = {
        type: 'test',
        port: 3502,
        getRouters: () => ({
          '/test': createTestRouter((_req, res) => {
            requestLog.push('handler')
            res.json({ log: requestLog })
          })
        })
      }

      const beforeMiddleware1 = (_req: any, _res: any, next: any) => {
        requestLog.push('before-1')
        next()
      }

      const beforeMiddleware2 = (_req: any, _res: any, next: any) => {
        requestLog.push('before-2')
        next()
      }

      AutoServer.addServer(testServer)
      servers = await AutoServer.start({
        middlewares: {
          before: [beforeMiddleware1, beforeMiddleware2]
        }
      })
      servers.forEach(s => s.server && activeServers.add(s.server))

      const testServerInstance = servers.find(s => s.type === 'test')
      expect(testServerInstance).toBeTruthy()

      await supertest(testServerInstance!.app)
        .get('/test')
        .expect(200)

      expect(requestLog).toEqual(['before-1', 'before-2', 'handler'])
    })

    it('[EXPR-I0034] should execute after middleware chain correctly', async () => {
      const requestLog: string[] = []
      const testServer: Omit<TServer, 'server'> = {
        type: 'test',
        port: 3502,
        getRouters: () => ({
          '/test': (() => {
            const router = Router()
            router.get('/', (_req, res, next) => {
              requestLog.push('handler')
              // Store data in res.locals instead of sending response
              res.locals.responseData = { log: requestLog }
              next()
            })
            return router
          })()
        })
      }

      const afterMiddleware1 = (_req: any, res: any, next: any) => {
        requestLog.push('after-1')
        next()
      }

      const afterMiddleware2 = (_req: any, res: any, next: any) => {
        requestLog.push('after-2')
        // Send response in last middleware
        res.json(res.locals.responseData)
      }

      AutoServer.addServer(testServer)
      servers = await AutoServer.start({
        middlewares: {
          after: [afterMiddleware1, afterMiddleware2]
        }
      })
      servers.forEach(s => s.server && activeServers.add(s.server))

      const testServerInstance = servers.find(s => s.type === 'test')
      expect(testServerInstance).toBeTruthy()

      await supertest(testServerInstance!.app)
        .get('/test')
        .expect(200)

      expect(requestLog).toEqual(['handler', 'after-1', 'after-2'])
    })

    it('[EXPR-I0035] should execute complete middleware chain in correct order', async () => {
      const requestLog: string[] = []
      const testServer: Omit<TServer, 'server'> = {
        type: 'test',
        port: 3502,
        getRouters: () => ({
          '/test': (() => {
            const router = Router()
            router.use((_req, _res, next) => {
              requestLog.push('route-before')
              next()
            })
            router.get('/', (_req, res, next) => {
              requestLog.push('handler')
              // Store data in res.locals instead of sending response
              res.locals.responseData = { log: requestLog }
              next()
            })
            router.use((_req, _res, next) => {
              requestLog.push('route-after')
              next()
            })
            return router
          })()
        })
      }

      const beforeMiddleware = (_req: any, _res: any, next: any) => {
        requestLog.push('before')
        next()
      }

      const afterMiddleware = (_req: any, res: any, next: any) => {
        requestLog.push('after')
        // Send response in last middleware
        res.json(res.locals.responseData)
      }

      AutoServer.addServer(testServer)
      servers = await AutoServer.start({
        middlewares: {
          before: [beforeMiddleware],
          after: [afterMiddleware]
        }
      })
      servers.forEach(s => s.server && activeServers.add(s.server))

      const testServerInstance = servers.find(s => s.type === 'test')
      expect(testServerInstance).toBeTruthy()

      await supertest(testServerInstance!.app)
        .get('/test')
        .expect(200)

      expect(requestLog).toEqual([
        'before',
        'route-before',
        'handler',
        'route-after',
        'after'
      ])
    })
  })
}) 
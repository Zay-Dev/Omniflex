import { Request, Response, NextFunction } from 'express'
import { UsersController } from './users.controller'
import { resolve, PasswordAuthService } from '@omniflex/module-identity-core'
import { jest } from '@jest/globals'
import { IUserRepository, IUserProfileRepository, TUser, TUserProfile } from '@omniflex/module-identity-core/types'

const mockRequest = () => ({
  ip: '127.0.0.1',
  headers: {
    forwarded: '127.0.0.1'
  }
}) as Request

const mockResponse = () => ({
  json: jest.fn(),
  status: jest.fn().mockReturnThis()
}) as unknown as Response

const mockNext = jest.fn() as NextFunction

const mockUsers = {
  findOne: jest.fn()
} as unknown as jest.Mocked<IUserRepository<TUser>>

const mockProfiles = {
  findOne: jest.fn()
} as unknown as jest.Mocked<IUserProfileRepository>

jest.mock('@omniflex/module-identity-core', () => ({
  resolve: jest.fn(() => ({
    users: mockUsers,
    profiles: mockProfiles
  })),
  PasswordAuthService: jest.fn()
}))

describe('UsersController', () => {
  let controller: UsersController
  let mockPasswordService

  beforeEach(() => {
    jest.clearAllMocks()
    mockPasswordService = {
      registerWithUsername: jest.fn(),
      loginByUsername: jest.fn()
    }
    ;(PasswordAuthService as jest.Mock).mockImplementation(() => mockPasswordService)
    controller = new UsersController(mockRequest(), mockResponse(), mockNext)
  })

  describe('register', () => {
    it('[AUTH-C0010] should register user with username and password', async () => {
      // Arrange
      const appType = 'web'
      const password = 'password123'
      const data = { username: 'testuser' }
      const expectedUser = {
        id: 1,
        username: 'testuser',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as unknown as TUser
      mockPasswordService.registerWithUsername.mockResolvedValue(expectedUser)

      // Act
      const result = await controller['register'](appType, password, data)

      // Assert
      expect(result).toBe(expectedUser)
      expect(mockPasswordService.registerWithUsername).toHaveBeenCalledWith(
        { password, username: data.username },
        data
      )
    })

    it('[AUTH-E0010] should handle registration error', async () => {
      // Arrange
      const appType = 'web'
      const password = 'password123'
      const data = { username: 'testuser' }
      const error = new Error('Registration failed')
      mockPasswordService.registerWithUsername.mockRejectedValue(error)

      // Act & Assert
      await expect(controller['register'](appType, password, data))
        .rejects.toThrow('Registration failed')
    })
  })

  describe('login', () => {
    it('[AUTH-R0010] should login user with username and password', async () => {
      // Arrange
      const appType = 'web'
      const credentials = { username: 'testuser', password: 'password123' }
      const expectedUser = {
        id: 1,
        username: 'testuser',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as unknown as TUser
      mockPasswordService.loginByUsername.mockResolvedValue(expectedUser)

      // Act
      const result = await controller['login'](appType, credentials)

      // Assert
      expect(result).toBe(expectedUser)
      expect(mockPasswordService.loginByUsername).toHaveBeenCalledWith({
        ...credentials,
        remoteAddress: '127.0.0.1'
      })
    })

    it('[AUTH-E0020] should handle login error', async () => {
      // Arrange
      const appType = 'web'
      const credentials = { username: 'testuser', password: 'wrong' }
      const error = new Error('Invalid credentials')
      mockPasswordService.loginByUsername.mockRejectedValue(error)

      // Act & Assert
      await expect(controller['login'](appType, credentials))
        .rejects.toThrow('Invalid credentials')
    })
  })

  describe('getProfile', () => {
    it('[AUTH-R0020] should get user profile by userId', async () => {
      // Arrange
      const userId = 1
      const expectedProfile = {
        id: 1,
        userId: 1,
        name: 'Test User',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as unknown as TUserProfile
      mockProfiles.findOne.mockResolvedValue(expectedProfile)

      // Act
      const result = await controller['getProfile'](userId)

      // Assert
      expect(result).toBe(expectedProfile)
      expect(mockProfiles.findOne).toHaveBeenCalledWith({
        userId,
        deletedAt: null
      })
    })

    it('[AUTH-E0030] should handle profile not found', async () => {
      // Arrange
      const userId = 999
      mockProfiles.findOne.mockResolvedValue(null)

      // Act
      const result = await controller['getProfile'](userId)

      // Assert
      expect(result).toBeNull()
    })
  })
})
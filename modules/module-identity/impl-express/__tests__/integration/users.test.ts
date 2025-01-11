import express from 'express'
import request from 'supertest'
import { UsersController } from '../../controllers/users.controller'
import { resolve, PasswordAuthService } from '@omniflex/module-identity-core'
import { TUser, IUserRepository, IUserProfileRepository, TUserProfile } from '@omniflex/module-identity-core/types'
import { jest } from '@jest/globals'

const mockUsers = {
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
} as unknown as jest.Mocked<IUserRepository<TUser>>

const mockProfiles = {
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
} as unknown as jest.Mocked<IUserProfileRepository>

type TCredentials = {
  username: string;
  password: string;
}

const createMockUser = (username: string): TUser => ({
  id: '1',
  identifier: username,
  isVerified: false,
  lastSignInAtUtc: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
})

const createMockProfile = (userId: string): TUserProfile => ({
  id: '1',
  userId,
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  user: createMockUser('testuser'),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
})

jest.mock('@omniflex/module-identity-core', () => ({
  resolve: jest.fn(() => ({
    users: mockUsers,
    profiles: mockProfiles
  })),
  PasswordAuthService: jest.fn(() => ({
    registerWithUsername: jest.fn().mockImplementation(async (...args: any[]) => {
      const [credentials] = args;
      return createMockUser(credentials.username);
    }),
    loginByUsername: jest.fn().mockImplementation(async (...args: any[]) => {
      const [credentials] = args;
      return createMockUser(credentials.username);
    })
  }))
}))

describe('Users Integration Tests', () => {
  let app: express.Application

  beforeEach(() => {
    jest.clearAllMocks()
    app = express()
    app.use(express.json())

    // Register route
    app.post('/register', (req, res, next) => {
      return UsersController.create(async (controller) => {
        try {
          const user = await (controller as any).register(
            req.body.appType,
            req.body.password,
            {
              username: req.body.username,
              email: req.body.email
            }
          )
          res.json(user)
        } catch (error: any) {
          res.status(400).json({ error: error?.message || 'Registration failed' })
        }
      })(req, res, next)
    })

    // Login route
    app.post('/login', (req, res, next) => {
      return UsersController.create(async (controller) => {
        try {
          const user = await (controller as any).login(
            req.body.appType,
            {
              username: req.body.username,
              password: req.body.password
            }
          )
          res.json(user)
        } catch (error: any) {
          res.status(401).json({ error: error?.message || 'Login failed' })
        }
      })(req, res, next)
    })

    // Profile route
    app.get('/profile/:userId', (req, res, next) => {
      return UsersController.create(async (controller) => {
        try {
          const profile = await (controller as any).getProfile(req.params.userId)
          if (!profile) {
            res.status(404).json({ error: 'Profile not found' })
            return
          }
          res.json(profile)
        } catch (error: any) {
          res.status(500).json({ error: error?.message || 'Internal server error' })
        }
      })(req, res, next)
    })
  })

  describe('Registration Flow', () => {
    it('[AUTH-C0100] should register a new user successfully', async () => {
      // Arrange
      const userData = {
        username: 'newuser',
        password: 'Password123!',
        email: 'newuser@example.com',
        appType: 'web'
      }

      // Act
      const response = await request(app)
        .post('/register')
        .send(userData)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('id')
      expect(response.body.identifier).toBe(userData.username)
    })

    it('[AUTH-E0100] should reject invalid registration data', async () => {
      // Arrange
      const invalidData = {
        username: '',
        password: 'weak',
        appType: 'web'
      }

      ;(PasswordAuthService as jest.Mock).mockImplementationOnce(() => ({
        registerWithUsername: jest.fn().mockRejectedValue(new Error('Invalid registration data') as never)
      }))

      // Act
      const response = await request(app)
        .post('/register')
        .send(invalidData)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('Login Flow', () => {
    it('[AUTH-R0100] should login registered user successfully', async () => {
      // Arrange
      const credentials = {
        username: 'existinguser',
        password: 'Password123!',
        appType: 'web'
      }

      // Act
      const response = await request(app)
        .post('/login')
        .send(credentials)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('id')
      expect(response.body.identifier).toBe(credentials.username)
    })

    it('[AUTH-E0110] should reject invalid credentials', async () => {
      // Arrange
      const invalidCredentials = {
        username: 'nonexistent',
        password: 'wrongpass',
        appType: 'web'
      }

      ;(PasswordAuthService as jest.Mock).mockImplementationOnce(() => ({
        loginByUsername: jest.fn().mockRejectedValue(new Error('Invalid credentials') as never)
      }))

      // Act
      const response = await request(app)
        .post('/login')
        .send(invalidCredentials)

      // Assert
      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('Profile Flow', () => {
    it('[AUTH-R0110] should get user profile successfully', async () => {
      // Arrange
      const userId = '123'
      const mockProfile = createMockProfile(userId)

      mockProfiles.findOne.mockResolvedValueOnce(mockProfile)

      // Act
      const response = await request(app)
        .get(`/profile/${userId}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toEqual(expect.objectContaining({
        id: mockProfile.id,
        userId: mockProfile.userId,
        firstName: mockProfile.firstName,
        lastName: mockProfile.lastName
      }))
    })

    it('[AUTH-E0120] should handle profile not found', async () => {
      // Arrange
      const userId = '999'
      mockProfiles.findOne.mockResolvedValueOnce(null)

      // Act
      const response = await request(app)
        .get(`/profile/${userId}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error')
    })
  })
})
import { mockUser } from '@omniflex/module-identity-core/__tests__/utils/mocks';
import { createMockRequest, createMockResponse, createMockNext } from './utils/express.mock';
import { UsersController } from '../users.controller';

const mockService = {
  users: {
    findById: jest.fn()
  },
  profiles: {
    findOne: jest.fn()
  }
};

const mockPasswordAuthService = {
  registerWithUsername: jest.fn(),
  loginByUsername: jest.fn()
};

jest.mock('@omniflex/module-identity-core', () => ({
  resolve: () => mockService
}));

jest.mock('@omniflex/module-identity-core/password-auth.service', () => ({
  PasswordAuthService: jest.fn().mockImplementation(() => mockPasswordAuthService)
}));

class TestUsersController extends UsersController {
  public async testRegister(appType: string, password: string, data: { username: string; email?: string; }) {
    return this.register(appType, password, data);
  }

  public async testLogin(appType: string, data: { username: string; password: string; }) {
    return this.login(appType, data);
  }

  public get testRemoteAddress() {
    return this.remoteAddress;
  }
}

describe('UsersController', () => {
  const req = createMockRequest({
    headers: {
      forwarded: '127.0.0.1'
    }
  });
  const res = createMockResponse();
  res.locals = { user: mockUser };
  const next = createMockNext();
  const controller = new TestUsersController(req, res, next);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerData = {
      username: 'test-username',
      password: 'Test123!',
      repeatPassword: 'Test123!',
      email: 'test@example.com'
    };

    it('should register user successfully', async () => {
      mockPasswordAuthService.registerWithUsername.mockResolvedValue(mockUser);

      await controller.testRegister('test-app', registerData.password, {
        username: registerData.username,
        email: registerData.email
      });

      expect(mockPasswordAuthService.registerWithUsername).toHaveBeenCalledWith(
        {
          password: registerData.password,
          username: registerData.username
        },
        {
          email: registerData.email,
          username: registerData.username
        }
      );
    });
  });

  describe('login', () => {
    const loginData = {
      username: 'test-username',
      password: 'Test123!'
    };

    it('should login user successfully', async () => {
      mockPasswordAuthService.loginByUsername.mockResolvedValue(mockUser);

      await controller.testLogin('test-app', loginData);

      expect(mockPasswordAuthService.loginByUsername).toHaveBeenCalledWith({
        username: loginData.username,
        password: loginData.password,
        remoteAddress: '127.0.0.1'
      });
    });
  });
});
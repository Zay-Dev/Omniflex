import { errors } from '@omniflex/core';
import { container } from '../containers';

import {
  TUser,
  IUserRepository,
  IUserProfileRepository,
  IUserPasswordRepository,
  ILoginAttemptRepository,
} from '../types';

import { IHashProvider } from '@omniflex/core/types/hash';

export class AuthService {
  private hashProvider: IHashProvider;
  private users: IUserRepository;
  private profiles: IUserProfileRepository;
  private passwords: IUserPasswordRepository;
  private loginAttempts: ILoginAttemptRepository;

  constructor() {
    this.hashProvider = container.resolve('hashProvider');
    this.users = container.resolve('userRepository');
    this.profiles = container.resolve('userProfileRepository');
    this.passwords = container.resolve('userPasswordRepository');
    this.loginAttempts = container.resolve('loginAttemptRepository');
  }

  async register(data: {
    username: string;
    password: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profile?: any;
  }) {
    const user = await this.users.create({
      identifier: data.username,
    });

    const hashedPassword = await this.hashProvider.hash(data.password);

    await this.passwords.create({
      user,
      username: data.username,
      hashedPassword
    });

    if (data.email || data.firstName || data.lastName || data.profile) {
      await this.profiles.create({
        user,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profile: data.profile
      });
    }

    return user;
  }

  async login(data: {
    username: string;
    password: string;
    appType: string;
    ipAddress?: string;
  }) {
    const password = await this.passwords.findByUsername(data.username);
    if (!password) {
      throw errors.unauthorized({ error: 'INVALID_CREDENTIALS' });
    }

    const isValidPassword = await this.hashProvider.verify(
      data.password,
      password.hashedPassword
    );

    if (!isValidPassword) {
      await this.recordLoginAttempt({
        user: password.user,
        success: false,
        loginType: 'PASSWORD',
        appType: data.appType,
        ipAddress: data.ipAddress
      });
      throw errors.unauthorized({ error: 'INVALID_CREDENTIALS' });
    }

    const user = await this.users.findOne({ id: password.user.id });
    if (!user) {
      throw errors.unauthorized({ error: 'USER_NOT_FOUND' });
    }

    await this.recordLoginAttempt({
      user,
      success: true,
      loginType: 'PASSWORD',
      appType: data.appType,
      ipAddress: data.ipAddress
    });

    await this.users.update(user.id, {
      lastSignInAtUtc: new Date()
    });

    return user;
  }

  private async recordLoginAttempt(data: {
    user: TUser;
    success: boolean;
    loginType: string;
    appType: string;
    ipAddress?: string;
    remark?: any;
  }) {
    return this.loginAttempts.create({
      user: data.user,
      identifier: data.user.identifier,
      success: data.success,
      loginType: data.loginType,
      appType: data.appType,
      ipAddress: data.ipAddress,
      remark: data.remark
    });
  }
}

export const createAuthService = () => new AuthService();
import { Request, Response, NextFunction } from 'express';
import { getControllerCreator } from '@omniflex/infra-express';
import { resolve, PasswordAuthService } from '@omniflex/module-identity-core';
import { BaseEntitiesController } from '@omniflex/infra-express/utils/base-entities-controller';

import {
  TUser,
  IUserRepository,
  IUserProfileRepository,
} from '@omniflex/module-identity-core/types';

export class UsersController<T extends TUser = TUser>
  extends BaseEntitiesController<T> {
  protected users: IUserRepository<T>;
  protected profiles: IUserProfileRepository;

  constructor(req: Request, res: Response, next: NextFunction) {
    const { users, profiles } = resolve<T>();
    super(req, res, next, users);

    this.users = users;
    this.profiles = profiles;
  }

  static create = getControllerCreator(UsersController);

  protected async register(
    appType: string,
    password: string,
    data: {
      email?: string;
      username: string;
    },
  ) {
    return new PasswordAuthService(appType)
      .registerWithUsername({
        password,
        username: data.username,
      }, data);
  }

  protected async login(appType, { username, password }) {
    return new PasswordAuthService(appType)
      .loginByUsername({
        username,
        password,
        remoteAddress: this.remoteAddress,
      }) as any as Promise<T>;
  }

  protected async getProfile(userId: any) {
    return this.profiles.findOne({
      userId,
      deletedAt: null,
    });
  }
}
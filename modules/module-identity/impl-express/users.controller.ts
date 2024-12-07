import { BaseEntitiesController } from '@omniflex/infra-express/utils/base-entities-controller';

import { resolve } from '@omniflex/module-identity-core';

import { PasswordAuthService }
  from '@omniflex/module-identity-core/password-auth.service';

import {
  TUser,
  IUserRepository,
  IUserProfileRepository,
} from '@omniflex/module-identity-core/types';

export class UsersController<T extends TUser = TUser>
  extends BaseEntitiesController<T> {
  protected users: IUserRepository<T>;
  protected profiles: IUserProfileRepository;

  constructor(req, res, next) {
    const { users, profiles } = resolve<T>();
    super(req, res, next, users);

    this.users = users;
    this.profiles = profiles;
  }

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
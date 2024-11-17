import { Request, Response, NextFunction } from 'express';
import { BaseEntitiesController } from '@omniflex/infra-express/utils/base-entities-controller';

import { container } from '@omniflex/module-identity-core/containers';
import { IUserRepository, TUser } from '@omniflex/module-identity-core/types';

import { PasswordAuthService }
  from '@omniflex/module-identity-core/password-auth.service';

export class UsersController<T extends TUser = TUser>
  extends BaseEntitiesController<T> {
  protected users: IUserRepository<T> = null as any;

  constructor(req, res, next) {
    const repository = container.resolve<IUserRepository<T>>('userRepository');

    super(req, res, next, repository);
    this.users = repository;
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
        ipAddress: this.ipAddress,
      });
  }

  getUserByIdentifier = () => {
    return this.tryAction(async () => {
      const { identifier } = this.req.params;

      const user = await this.users.findByIdentifier(identifier);
      if (!user) {
        this.throwNotFound('USER_NOT_FOUND');
      }

      return this.respondOne(user);
    });
  };

  getUserByUsername = () => {
    return this.tryAction(async () => {
      const { username } = this.req.params;

      const user = await this.users.findByUsername(username);
      if (!user) {
        this.throwNotFound('USER_NOT_FOUND');
      }

      return this.respondOne(user);
    });
  };

  getUserByEmail = () => {
    return this.tryAction(async () => {
      const { email } = this.req.params;

      const user = await this.users.findByEmail(email);
      if (!user) {
        this.throwNotFound('USER_NOT_FOUND');
      }

      return this.respondOne(user);
    });
  };
}

export const getCreator = <T extends UsersController = UsersController>(
  constructor: new (req: Request, res: Response, next: NextFunction) => T
) => {
  return (req: Request, res: Response, next: NextFunction) =>
    new constructor(req, res, next);
};
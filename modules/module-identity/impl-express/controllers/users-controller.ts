import { BaseEntitiesController } from '@omniflex/infra-express/utils/base-entities-controller';
import { container } from '@omniflex/module-identity-core/containers';

import { Request, Response, NextFunction } from '@omniflex/infra-express/types';
import { IUserRepository, TUser } from '@omniflex/module-identity-core/types';

export class UsersController extends BaseEntitiesController<TUser> {
  protected users: IUserRepository = null as any;

  constructor(req: Request, res: Response, next: NextFunction) {
    const repository = container.resolve<IUserRepository>('userRepository');

    super(req, res, next, repository);
    this.users = repository;
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

export const create = (req: Request, res: Response, next: NextFunction) =>
  new UsersController(req, res, next);
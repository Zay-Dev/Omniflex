import { errors } from '@omniflex/core';
import { IBaseRepository } from '@omniflex/core/types';

import { BaseExpressController } from './base-controller';
import { Request, Response, NextFunction, TLocals } from '../types';

type TBaseLocals = TLocals;

export class BaseEntitiesController<
  TEntity extends { id: TPrimaryKey; },
  TPrimaryKey = string,
  TLocals extends TBaseLocals = TBaseLocals
> extends BaseExpressController<TLocals> {
  constructor(
    req: Request,
    res: Response,
    next: NextFunction,
    protected readonly repository: IBaseRepository<TEntity, TPrimaryKey>,
  ) {
    super(req, res, next);

    if (!repository) {
      throw errors.custom('repository is required');
    }
  }

  protected get entityId(): TPrimaryKey {
    const id = this.pathId;

    if (typeof id === 'undefined') {
      throw errors.custom('Path id is required');
    }
    
    return id as unknown as TPrimaryKey;
  }

  tryGetOne() {
    return this.tryAction(async () => {
      const id = this.entityId;
      const entity = await this.repository.findById(id);

      if (!entity) {
        this.throwNotFound();
      }

      return this.respondOne(entity);
    });
  }

  tryListAll() {
    return this.tryAction(async () => {
      const entities = await this.repository.find({});

      return this.respondMany(entities);
    });
  }

  tryListPaginated() {
    return this.tryAction(async () => {
      const { page, pageSize } = this;

      const entities = await this.repository.find({}, {
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

      return this.respondMany(entities);
    });
  }

  tryCreate<T extends Partial<TEntity> = Partial<TEntity>>() {
    return this.tryActionWithBody<T>(async (body) => {
      const entity = await this.repository.create(body);

      if (!entity) {
        throw errors.custom('Failed to create entity');
      }

      return this.respondOne(entity);
    });
  }

  tryUpdate<T extends Partial<TEntity> = Partial<TEntity>>() {
    return this.tryActionWithBody<T>(async (body) => {
      const id = this.entityId;
      const entity = await this.repository.updateById(id, body);

      if (!entity) {
        this.throwNotFound();
      }

      return this.respondOne(entity);
    });
  }

  tryDelete() {
    return this.tryAction(async () => {
      const id = this.entityId;
      const success = await this.repository.delete(id);

      if (!success) {
        this.throwNotFound();
      }

      return this.respondOne({ success });
    });
  }

  trySoftDelete() {
    return this.tryAction(async () => {
      const id = this.entityId;
      const success = await this.repository.softDelete(id);

      if (!success) {
        this.throwNotFound();
      }

      return this.respondOne({ success });
    });
  }
}
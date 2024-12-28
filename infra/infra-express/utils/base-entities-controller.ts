import { errors } from '@omniflex/core';
import { IBaseRepository } from '@omniflex/core/types';

import { TInfraExpressLocals } from '../internal-types';
import { Request, Response, NextFunction } from 'express';

import { BaseExpressController, TBaseExpressControllerOptions } from './base-controller';

type TBaseLocals = TInfraExpressLocals;

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
    options: TBaseExpressControllerOptions = {},
  ) {
    super(req, res, next, options);

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

  tryListAll(query?: Parameters<typeof this.repository['find']>[0]) {
    return this.tryAction(async () => {
      const entities = await this.repository.find(query || {});

      return this.respondMany(entities);
    });
  }

  tryListPaginated(query?: Parameters<typeof this.repository['find']>[0]) {
    return this.tryAction(async () => {
      const { page, pageSize } = this;

      const entities = await this.repository.find(query || {}, {
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

      return this.respondMany(entities);
    });
  }

  tryCreate<T extends Partial<TEntity> = Partial<TEntity>>(
    additionalBody?: T,
    { respondOne = this.respondOne.bind(this) }: {
      respondOne?: (entity: TEntity) => void;
    } = {},
  ) {
    return this.tryActionWithBody<T>(async (body) => {
      const extendedBody = additionalBody ?
        Object.assign(body, additionalBody) :
        body;
      const entity = await this.repository.create(extendedBody);

      if (!entity) {
        throw errors.custom('Failed to create entity');
      }

      return respondOne(entity);
    });
  }

  tryUpdate<T extends Partial<TEntity> = Partial<TEntity>>(
    additionalBody?: T,
    { respondOne = this.respondOne.bind(this) }: {
      respondOne?: (entity: TEntity) => void;
    } = {},
  ) {
    return this.tryActionWithBody<T>(async (body) => {
      const id = this.entityId;
      const extendedBody = additionalBody ?
        Object.assign(body, additionalBody) :
        body;

      const entity = await this.repository.updateById(id, extendedBody);

      if (!entity) {
        this.throwNotFound();
      }

      return respondOne(entity!);
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
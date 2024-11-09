import { errors } from '@omniflex/core';
import { IBaseRepository } from '@omniflex/core/types/repository';
import { BaseController } from './base-controller';
import { Request, Response, NextFunction, TLocals } from '../types';

type TBaseLocals = TLocals;

type TPaginationQuery = {
  page?: string | number;
  pageSize?: string | number;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
};

type TQueryOptions = {
  pagination?: TPaginationQuery;
  filter?: Record<string, any>;
};

export class BaseEntitiesController<
  TEntity extends { id: TPrimaryKey; },
  TPrimaryKey = string,
  TLocals extends TBaseLocals = TBaseLocals
> extends BaseController<TLocals> {
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

  tryGetOne() {
    return this.tryAction(async () => {
      const id = this.pathId() as TPrimaryKey;
      const entity = await this.repository.findById(id);

      if (!entity) {
        this.throwNotFound();
      }

      return this.respondOne(entity);
    });
  }

  tryListAll() {
    return this.tryAction(async () => {
      const entities = await this.repository.find({} as any);

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
      const id = this.pathId() as TPrimaryKey;
      const entity = await this.repository.update(id, body);

      if (!entity) {
        this.throwNotFound();
      }

      return this.respondOne(entity);
    });
  }

  trySoftDelete() {
    return this.tryAction(async () => {
      const id = this.pathId() as TPrimaryKey;
      const success = await this.repository.softDelete(id);

      if (!success) {
        this.throwNotFound();
      }

      return this.respondOne({ success });
    });
  }

  tryDelete() {
    return this.tryAction(async () => {
      const id = this.pathId() as TPrimaryKey;
      const success = await this.repository.delete(id);

      if (!success) {
        this.throwNotFound();
      }

      return this.respondOne({ success });
    });
  }

  protected getPaginationParams(query: TPaginationQuery = {}) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || this.pageSize();
    const sort = query.sort || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    return { page, pageSize, sort, sortOrder };
  }

  protected sortEntities(
    entities: TEntity[],
    sort: string,
    sortOrder: 'asc' | 'desc'
  ) {
    return [...entities].sort((a: any, b: any) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      return multiplier * (a[sort] > b[sort] ? 1 : -1);
    });
  }

  protected paginateEntities(
    entities: TEntity[],
    page: number,
    pageSize: number
  ) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return entities.slice(start, end);
  }
}
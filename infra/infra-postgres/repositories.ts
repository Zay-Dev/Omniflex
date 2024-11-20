import { BaseRepository } from './repositories/base';
import { RawRepository } from './repositories/raw-repository';

import { Identifier } from 'sequelize';
import { IBaseRepository } from '@omniflex/core/types/repository';

export class PostgresRepository<
  T extends { id: TPrimaryKey; },
  TPrimaryKey extends Identifier = string
>
  extends BaseRepository<T>
  implements IBaseRepository<T, TPrimaryKey> {
  raw() {
    return new RawRepository<T, TPrimaryKey>(this.model, {
      ...this.options,
    });
  }

  async exists(filter: Partial<T>): Promise<boolean> {
    const count = await this.model.count({ where: filter as any });

    return count > 0;
  }

  async findById(id: TPrimaryKey): Promise<T | null> {
    return (await this.model.findByPk(id))?.toJSON() || null;
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    return (
      await this.model.findOne({ where: filter as any }))
      ?.toJSON() || null;
  }

  async find(
    filter: Partial<T>,
    options?: { skip?: number; take?: number; },
  ): Promise<T[]> {
    return (await this.model
      .findAll({
        ...this.sharedQueryOptions,

        where: filter as any,
        limit: options?.take,
        offset: options?.skip,
      }))
      .map(entity => entity.toJSON());
  }

  async create(data: Partial<T>): Promise<T> {
    const instance = await this.model.create(
      data as any,
      this.sharedQueryOptions,
    );

    return instance.toJSON();
  }

  async update(id: TPrimaryKey, data: Partial<T>): Promise<T | null> {
    await this.model.update(
      data as any, {
      where: { id: id as any },
      ...this.sharedQueryOptions,
    });

    return this.findById(id);
  }

  async delete(id: TPrimaryKey) {
    const result = await this.model
      .destroy({ where: { id: id as any } });

    return result > 0;
  }

  async softDelete(id: TPrimaryKey) {
    const result = await this.update(id, { isDeleted: true } as any);

    return !!result;
  }
}
import { logger } from '@omniflex/core';
import { Identifier, Op } from 'sequelize';
import { BaseRepository } from './repositories/base';
import { RawRepository } from './repositories/raw-repository';
import {
  TQueryFilter,
  TQueryOptions,
  TQueryOperators,
  IBaseRepository,
} from '@omniflex/core/types/repository';

export class SequelizeRepository<
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

  isValidPrimaryKey(id: TPrimaryKey): boolean {
    const type = `${this.model.getAttributes()['id']?.type || ''}`;

    switch (type) {
      case 'INTEGER':
        return !isNaN(Number(id));
      case 'UUID':
        return id &&
          typeof id === 'string' &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    }

    logger.warn(
      `Failed to validate ${id} with type ${type}`,
      { tags: ['Sequelize', this.model.tableName] },
    );
    return true;
  }

  async exists(filter: TQueryFilter<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<boolean> {
    const count = await this.count(filter, options);
    return count > 0;
  }

  async count(filter: TQueryFilter<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<number> {
    return this.model.count({
      where: this.transformFilter(filter),
      paranoid: options?.paranoid ?? true,
    });
  }

  async findById(id: TPrimaryKey, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null> {
    const result = await this.model.findByPk(id, {
      paranoid: options?.paranoid ?? true,
    });
    return result?.toJSON() || null;
  }

  async findOne(filter: TQueryFilter<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null> {
    const result = await this.model.findOne({
      where: this.transformFilter(filter),
      paranoid: options?.paranoid ?? true,
    });
    return result?.toJSON() || null;
  }

  async find(filter: TQueryFilter<T>, options?: TQueryOptions<T>): Promise<T[]> {
    const results = await this.model.findAll({
      where: this.transformFilter(filter),
      offset: options?.skip,
      limit: options?.take,
      order: options?.sort ?
        Object.entries(options.sort).map(([key, value]) => [key, value.toUpperCase()]) :
        undefined,
      paranoid: options?.paranoid ?? true,
    });
    return results.map(result => result.toJSON());
  }

  async create(data: Partial<T>): Promise<T> {
    const result = await this.model.create(data as any);
    return result.toJSON();
  }

  async updateById(id: TPrimaryKey, data: Partial<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null> {
    const [count] = await this.model.update(data as any, {
      where: { id: id as any },
      paranoid: options?.paranoid ?? true,
    });
    return count > 0 ? this.findById(id) : null;
  }

  async updateOne(filter: TQueryFilter<T>, data: Partial<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null> {
    const [count] = await this.model.update(data as any, {
      where: this.transformFilter(filter),
      paranoid: options?.paranoid ?? true,
      limit: 1,
    });
    if (count === 0) return null;

    return this.findOne(filter);
  }

  async update(filter: TQueryFilter<T>, data: Partial<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<number> {
    const [count] = await this.model.update(data as any, {
      where: this.transformFilter(filter),
      paranoid: options?.paranoid ?? true,
    });
    return count;
  }

  async deleteById(id: TPrimaryKey): Promise<boolean> {
    const count = await this.model.destroy({
      where: { id: id as any },
      force: true,
    });
    return count > 0;
  }

  async deleteOne(filter: TQueryFilter<T>): Promise<boolean> {
    const count = await this.model.destroy({
      where: this.transformFilter(filter),
      force: true,
      limit: 1,
    });
    return count > 0;
  }

  async delete(filter: TQueryFilter<T>): Promise<number> {
    return this.model.destroy({
      where: this.transformFilter(filter),
      force: true,
    });
  }

  async softDeleteById(id: TPrimaryKey): Promise<boolean> {
    const count = await this.model.destroy({
      where: { id: id as any },
    });
    return count > 0;
  }

  async softDeleteOne(filter: TQueryFilter<T>): Promise<boolean> {
    const count = await this.model.destroy({
      where: this.transformFilter(filter),
      limit: 1,
    });
    return count > 0;
  }

  async softDelete(filter: TQueryFilter<T>): Promise<number> {
    return this.model.destroy({
      where: this.transformFilter(filter),
    });
  }

  async restoreById(id: TPrimaryKey): Promise<boolean> {
    await this.model.restore({
      where: { id: id as any },
    });
    return true;
  }

  async restoreOne(filter: TQueryFilter<T>): Promise<boolean> {
    await this.model.restore({
      where: this.transformFilter(filter),
      limit: 1,
    });
    return true;
  }

  async restore(filter: TQueryFilter<T>): Promise<number> {
    await this.model.restore({
      where: this.transformFilter(filter),
    });
    return 1;
  }

  protected transformFilter(filter: TQueryFilter<T>) {
    if (!filter) return {};

    const transformed = {};
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined) continue;

      if (typeof value === 'object' && !Array.isArray(value)) {
        transformed[key] = this.transformOperators(value as TQueryOperators<any>);
      } else {
        transformed[key] = value;
      }
    }
    return transformed;
  }

  protected transformOperators(operators: TQueryOperators<any>) {
    if (!operators) return {};

    const transformed = {};
    for (const [key, value] of Object.entries(operators)) {
      if (value === undefined) continue;

      switch (key) {
        case '$eq': transformed[Op.eq] = value; break;
        case '$ne': transformed[Op.ne] = value; break;
        case '$gt': transformed[Op.gt] = value; break;
        case '$gte': transformed[Op.gte] = value; break;
        case '$lt': transformed[Op.lt] = value; break;
        case '$lte': transformed[Op.lte] = value; break;
        case '$in': transformed[Op.in] = value; break;
        case '$nin': transformed[Op.notIn] = value; break;
        case '$regex': transformed[Op.regexp] = value; break;
      }
    }
    return transformed;
  }
}
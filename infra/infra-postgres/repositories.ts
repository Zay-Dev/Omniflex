import { BaseRepository } from './repositories/base';
import { RawRepository } from './repositories/raw-repository';

import { Identifier, Op } from 'sequelize';

import {
  TDeepPartial,
  TQueryOptions,
  TQueryOperators,
  IBaseRepository,
} from '@omniflex/core/types/repository';

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

  async exists(filter: TDeepPartial<T>): Promise<boolean> {
    const count = await this.model.count({
      where: this.transformFilter(filter),
    });

    return count > 0;
  }

  async findById(
    id: TPrimaryKey,
    options?: TQueryOptions<T>,
  ): Promise<T | null> {
    const result = await this.model.findByPk(
      id,
      this.transformQueryOptions(options),
    );

    return result?.toJSON() || null;
  }

  async findOne(
    filter: TDeepPartial<T>,
    options?: TQueryOptions<T>,
  ): Promise<T | null> {
    const result = await this.model.findOne({
      ...this.transformQueryOptions(options),
      where: this.transformFilter(filter)
    });

    return result?.toJSON() || null;
  }

  async find(
    filter: TDeepPartial<T>,
    options?: TQueryOptions<T>,
  ): Promise<T[]> {
    return (await this.model
      .findAll({
        ...this.transformQueryOptions(options),
        where: this.transformFilter(filter),
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
      data as any,
      {
        where: { id: id as any },
        ...this.sharedQueryOptions,
      }
    );

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

  protected transformQueryOptions<T>(options?: TQueryOptions<T>) {
    if (!options) return this.sharedQueryOptions;

    const transformed = {
      ...this.sharedQueryOptions,
      offset: options.skip,
      limit: options.take,
      order: options.sort ?
        Object.entries(options.sort)
          .map(([key, value]) =>
            [key, (value as string).toUpperCase()]
          ) :
        undefined,
    };

    if (options.select) {
      const fields = (Array.isArray(options.select) ?
        options.select :
        options.select.split(' '))
        .map(String);

      const included = fields
        .filter(field => !field.startsWith('-'))
        .map(field => field.startsWith('+') ? field.slice(1) : field);

      const excluded = fields
        .filter(field => field.startsWith('-'))
        .map(field => field.slice(1));

      if (included.length + excluded.length === 0) {
        transformed['attributes'] = undefined;
      } else {
        const attributes = Object.keys(this.model.getAttributes())
          .filter(attr => !excluded.includes(attr));

        if (included.length > 0) {
          transformed['attributes'] = attributes.filter(attr =>
            included.includes(attr),
          );
        } else {
          transformed['attributes'] = attributes;
        }
      }
    }

    if (options.populate) {
      const fields = (Array.isArray(options.populate) ?
        options.populate :
        options.populate.split(' '))
        .map(String);

      transformed['include'] = fields.map(association => ({
        association,
      }));
    }

    return transformed;
  }

  protected transformFilter(filter: TDeepPartial<T>) {
    const transformed = {};

    for (const [key, value] of Object.entries(filter)) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        transformed[key] = this.transformOperators(value);
      } else {
        transformed[key] = value;
      }
    }

    return transformed;
  }

  protected transformOperators(operators: TQueryOperators<any>) {
    const transformed = {};

    for (const [key, value] of Object.entries(operators)) {
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
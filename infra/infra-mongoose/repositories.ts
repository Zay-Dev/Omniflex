import { BaseRepository } from './repositories/base';
import { RawRepository } from './repositories/raw-repository';

import { Document, FilterQuery } from 'mongoose';
import { IBaseRepository } from '@omniflex/core/types';

export class MongooseBaseRepository<T extends Document, TPrimaryKey = string>
  extends BaseRepository<T>
  implements IBaseRepository<T, TPrimaryKey> {
  raw() {
    return new RawRepository(this.model, {
      ...this.options,
    });
  }

  async exists(filter: Partial<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter as FilterQuery<T>);

    return count > 0;
  }

  findById(id: TPrimaryKey): Promise<T | null> {
    return this.model.findById(
      id,
      null,
      this.sharedQueryOptions,
    );
  }

  findOne(filter: Partial<T>): Promise<T | null> {
    return this.model.findOne(
      filter as FilterQuery<T>,
      null,
      this.sharedQueryOptions,
    );
  }

  find(
    filter: Partial<T>,
    options?: { skip?: number; take?: number; },
  ): Promise<T[]> {
    const query = this.model.find(
      filter as FilterQuery<T>,
      null,
      this.sharedQueryOptions,
    );

    if (options?.skip !== undefined) {
      query.skip(options.skip);
    }

    if (options?.take !== undefined) {
      query.limit(options.take);
    }

    return query;
  }

  create(data: Partial<T>): Promise<T> {
    const query = this.model.create(data);

    return this.noAutoLean ? query :
      query.then(result => result.toObject());
  }

  update(id: TPrimaryKey, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(
      id,
      data,
      {
        ...this.sharedQueryOptions,
        new: true,
      }
    );
  }

  async delete(id: TPrimaryKey): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);

    return !!result;
  }

  async softDelete(id: TPrimaryKey): Promise<boolean> {
    const result = await this.model.findByIdAndUpdate(id, { isDeleted: true });

    return !!result;
  }
}
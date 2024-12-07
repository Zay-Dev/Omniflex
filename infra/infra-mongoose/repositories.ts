import { BaseRepository } from './repositories/base';
import { RawRepository } from './repositories/raw-repository';

import {
  TDeepPartial,
  TQueryOptions,
  IBaseRepository,
} from '@omniflex/core/types';

export class MongooseBaseRepository<T, TPrimaryKey = string>
  extends BaseRepository<T>
  implements IBaseRepository<T, TPrimaryKey> {
  raw() {
    return new RawRepository(this.model, {
      ...this.options,
    });
  }

  isValidPrimaryKey(id: TPrimaryKey): boolean {
    return super.isValidDocumentId(id);
  }

  async exists(filter: TDeepPartial<T>): Promise<boolean> {
    const count = await this.model.countDocuments(
      this.transformFilter(filter),
      this.sharedQueryOptions,
    );

    return count > 0;
  }

  findById(_id: TPrimaryKey, options?: TQueryOptions<T>): Promise<T | null> {
    return this.model.findOne(
      {
        _id,
        ...this.getParanoidFilter(options),
      },
      null,
      this.transformQueryOptions(options)
    );
  }

  findOne(filter: TDeepPartial<T>, options?: TQueryOptions<T>): Promise<T | null> {
    return this.model.findOne(
      {
        ...this.transformFilter(filter),
        ...this.getParanoidFilter(options),
      },
      null,
      this.transformQueryOptions(options)
    );
  }

  find(filter: TDeepPartial<T>, options?: TQueryOptions<T>): Promise<T[]> {
    return this.model.find(
      {
        ...this.transformFilter(filter),
        ...this.getParanoidFilter(options),
      },
      null,
      this.transformQueryOptions(options)
    );
  }

  create(data: Partial<T>): Promise<T> {
    const query = this.model.create(data);

    return this.noAutoLean ? query :
      query.then(result => result.toObject());
  }

  async updateById(_id: TPrimaryKey, data: Partial<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(
      {
        _id,
        ...this.getParanoidFilter(),
      },
      data,
      {
        ...this.sharedQueryOptions,
        new: true,
      }
    );
  }

  async updateMany(filter: TDeepPartial<T>, data: Partial<T>) {
    return (await this.model
      .updateMany(
        {
          ...this.transformFilter(filter),
          ...this.getParanoidFilter(),
        },
        data,
        this.sharedQueryOptions,
      )).modifiedCount;
  }

  async delete(_id: TPrimaryKey): Promise<boolean> {
    const result = await this.model
      .findOneAndDelete({ _id });

    return !!result;
  }

  async softDelete(_id: TPrimaryKey): Promise<boolean> {
    const result = await this.model.findOneAndUpdate(
      {
        _id,
        deletedAt: null,
      },
      { deletedAt: new Date() },
      { new: true }
    );

    return !!result;
  }

  protected transformQueryOptions<T>(options?: TQueryOptions<T>) {
    if (!options) return this.sharedQueryOptions;

    const transformed = {
      ...this.sharedQueryOptions,
      skip: options.skip,
      limit: options.take,
      sort: options.sort,
    };

    if (options.select) {
      transformed['select'] = Array.isArray(options.select) ?
        options.select.join(' ') :
        options.select;
    }

    if (options.populate) {
      transformed['populate'] = options.populate;
    }

    return transformed;
  }

  protected transformFilter(filter: TDeepPartial<T>) {
    return filter;
  }

  protected getParanoidFilter(options?: TQueryOptions<T>) {
    if (options?.paranoid === false) return {};
    return { deletedAt: null };
  }
}
import { BaseRepository } from './repositories/base';
import { RawRepository } from './repositories/raw-repository';
import {
  TQueryFilter,
  TQueryOptions,
  TQueryOperators,
  IBaseRepository,
} from '@omniflex/core/types/repository';

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

  async exists(filter: TQueryFilter<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<boolean> {
    const count = await this.count(filter, options);
    return count > 0;
  }

  async count(filter: TQueryFilter<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<number> {
    return this.model.countDocuments(
      {
        ...this.transformFilter(filter),
      },
      {
        ...this.sharedQueryOptions,
        paranoid: options?.paranoid,
      },
    );
  }

  findById(_id: TPrimaryKey, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null> {
    return this.model.findOne(
      {
        _id,
      },
      null,
      {
        ...this.sharedQueryOptions,
        paranoid: options?.paranoid,
      },
    );
  }

  findOne(filter: TQueryFilter<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null> {
    return this.model.findOne(
      {
        ...this.transformFilter(filter),
      },
      null,
      {
        ...this.sharedQueryOptions,
        paranoid: options?.paranoid,
      },
    );
  }

  find(filter: TQueryFilter<T>, options?: TQueryOptions<T>): Promise<T[]> {
    return this.model.find(
      {
        ...this.transformFilter(filter),
      },
      null,
      {
        ...this.sharedQueryOptions,
        paranoid: options?.paranoid,
        skip: options?.skip,
        limit: options?.take,
        sort: options?.sort,
      },
    );
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = await this.model.create(data);
    return doc.toObject();
  }

  async updateById(_id: TPrimaryKey, data: Partial<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null> {
    return this.model.findOneAndUpdate(
      {
        _id,
      },
      data,
      {
        ...this.sharedQueryOptions,
        paranoid: options?.paranoid,
        new: true,
      },
    );
  }

  async updateOne(filter: TQueryFilter<T>, data: Partial<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null> {
    return this.model.findOneAndUpdate(
      {
        ...this.transformFilter(filter),
      },
      data,
      {
        ...this.sharedQueryOptions,
        paranoid: options?.paranoid,
        new: true,
      },
    );
  }

  async update(filter: TQueryFilter<T>, data: Partial<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<number> {
    const result = await this.model.updateMany(
      {
        ...this.transformFilter(filter),
      },
      data,
      {
        ...this.sharedQueryOptions,
        paranoid: options?.paranoid,
      },
    );
    return result.modifiedCount;
  }

  async deleteById(_id: TPrimaryKey): Promise<boolean> {
    const result = await this.model.findOneAndDelete(
      {
        _id,
      },
      this.sharedQueryOptions,
    );
    return !!result;
  }

  async deleteOne(filter: TQueryFilter<T>): Promise<boolean> {
    const result = await this.model.findOneAndDelete(
      {
        ...this.transformFilter(filter),
      },
      this.sharedQueryOptions,
    );
    return !!result;
  }

  async delete(filter: TQueryFilter<T>): Promise<number> {
    const result = await this.model.deleteMany(
      {
        ...this.transformFilter(filter),
      },
    );
    return result.deletedCount;
  }

  async softDeleteById(_id: TPrimaryKey): Promise<boolean> {
    const result = await this.updateById(_id, { deletedAt: new Date() } as any);
    return !!result;
  }

  async softDeleteOne(filter: TQueryFilter<T>): Promise<boolean> {
    const result = await this.updateOne(filter, { deletedAt: new Date() } as any);
    return !!result;
  }

  async softDelete(filter: TQueryFilter<T>): Promise<number> {
    return this.update(filter, { deletedAt: new Date() } as any);
  }

  async restore(filter: TQueryFilter<T>): Promise<number> {
    const result = await this.model.updateMany(
      {
        ...this.transformFilter(filter),
      },
      { deletedAt: null },
      {
        ...this.sharedQueryOptions,
        paranoid: false,
      },
    );
    return result.modifiedCount;
  }

  async restoreById(_id: TPrimaryKey): Promise<boolean> {
    const result = await this.model.findOneAndUpdate(
      {
        _id,
      },
      { deletedAt: null },
      {
        ...this.sharedQueryOptions,
        paranoid: false,
      },
    );
    return !!result;
  }

  async restoreOne(filter: TQueryFilter<T>): Promise<boolean> {
    const result = await this.model.findOneAndUpdate(
      {
        ...this.transformFilter(filter),
      },
      { deletedAt: null },
      {
        ...this.sharedQueryOptions,
        paranoid: false,
      },
    );
    return !!result;
  }

  protected transformFilter(filter: TQueryFilter<T>) {
    if (!filter) return {};

    const transformed = {};
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined) continue;

      // Handle non-plain objects (instances of classes)
      if (value !== null &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          value.constructor === Object) {
        transformed[key] = this.transformOperators(value as TQueryOperators<any>);
      } else {
        transformed[key] = value;
      }
    }
    return transformed;
  }

  protected transformOperators(operators: TQueryOperators<any>) {
    // Return early if not a plain object
    if (!operators ||
        operators === null ||
        typeof operators !== 'object' ||
        Array.isArray(operators) ||
        operators.constructor !== Object) {
      return operators;
    }

    const transformed = {};
    for (const [key, value] of Object.entries(operators)) {
      if (value === undefined) continue;

      // Only transform known MongoDB operators
      if (key.startsWith('$')) {
        switch (key) {
          case '$eq': transformed['$eq'] = value; break;
          case '$ne': transformed['$ne'] = value; break;
          case '$gt': transformed['$gt'] = value; break;
          case '$gte': transformed['$gte'] = value; break;
          case '$lt': transformed['$lt'] = value; break;
          case '$lte': transformed['$lte'] = value; break;
          case '$in': transformed['$in'] = value; break;
          case '$nin': transformed['$nin'] = value; break;
          case '$regex': transformed['$regex'] = value; break;
          default: transformed[key] = value; break;
        }
      } else {
        transformed[key] = value;
      }
    }
    return transformed;
  }
}
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
        ...this.getParanoidFilter(options),
      },
      this.sharedQueryOptions,
    );
  }

  findById(_id: TPrimaryKey, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null> {
    return this.model.findOne(
      {
        _id,
        ...this.getParanoidFilter(options),
      },
      null,
      this.sharedQueryOptions,
    );
  }

  findOne(filter: TQueryFilter<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null> {
    return this.model.findOne(
      {
        ...this.transformFilter(filter),
        ...this.getParanoidFilter(options),
      },
      null,
      this.sharedQueryOptions,
    );
  }

  find(filter: TQueryFilter<T>, options?: TQueryOptions<T>): Promise<T[]> {
    return this.model.find(
      {
        ...this.transformFilter(filter),
        ...this.getParanoidFilter(options),
      },
      null,
      {
        ...this.sharedQueryOptions,
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
        ...this.getParanoidFilter(options),
      },
      data,
      {
        ...this.sharedQueryOptions,
        new: true,
      },
    );
  }

  async updateOne(filter: TQueryFilter<T>, data: Partial<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null> {
    return this.model.findOneAndUpdate(
      {
        ...this.transformFilter(filter),
        ...this.getParanoidFilter(options),
      },
      data,
      {
        ...this.sharedQueryOptions,
        new: true,
      },
    );
  }

  async update(filter: TQueryFilter<T>, data: Partial<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<number> {
    const result = await this.model.updateMany(
      {
        ...this.transformFilter(filter),
        ...this.getParanoidFilter(options),
      },
      data,
      this.sharedQueryOptions,
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
      this.sharedQueryOptions,
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
        new: true,
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
        new: true,
      },
    );
    return !!result;
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
        case '$eq': transformed['$eq'] = value; break;
        case '$ne': transformed['$ne'] = value; break;
        case '$gt': transformed['$gt'] = value; break;
        case '$gte': transformed['$gte'] = value; break;
        case '$lt': transformed['$lt'] = value; break;
        case '$lte': transformed['$lte'] = value; break;
        case '$in': transformed['$in'] = value; break;
        case '$nin': transformed['$nin'] = value; break;
        case '$regex': transformed['$regex'] = value; break;
      }
    }
    return transformed;
  }

  protected getParanoidFilter(options?: Pick<TQueryOptions<T>, 'paranoid'>) {
    if (options?.paranoid === false) return {};
    return { deletedAt: null };
  }
}
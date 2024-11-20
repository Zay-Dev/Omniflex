import { IBaseRepository } from '@omniflex/core/types';
import { Model, Document, FilterQuery } from 'mongoose';

export class MongooseBaseRepository<T extends Document, TPrimaryKey = string>
  implements IBaseRepository<T, TPrimaryKey> {
  protected options: {
    noAliasId: boolean;
    noAutoLean: boolean;
  };

  constructor(
    protected readonly model: Model<T>,
    options?: {
      noAliasId?: boolean;
      noAutoLean?: boolean;
    },
  ) {
    this.options = {
      noAutoLean: options?.noAutoLean || false,
      noAliasId: options?.noAliasId || false,
    };

    if (!this.options.noAliasId) {
      this.model.schema.alias('_id', 'id');
      this.model.recompileSchema();
    }
  }

  getModel() {
    return this.model;
  }

  autoLean() {
    return new MongooseBaseRepository(this.model, {
      ...this.options,
      noAutoLean: false,
    });
  }

  noAutoLean() {
    return new MongooseBaseRepository(this.model, {
      ...this.options,
      noAutoLean: true,
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
      this._sharedQueryOptions,
    );
  }

  findOne(filter: Partial<T>): Promise<T | null> {
    return this.model.findOne(
      filter as FilterQuery<T>,
      null,
      this._sharedQueryOptions,
    );
  }

  find(
    filter: Partial<T>,
    options?: { skip?: number; take?: number; }
  ): Promise<T[]> {
    const query = this.model.find(
      filter as FilterQuery<T>,
      null,
      this._sharedQueryOptions,
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

    return this._noAutoLean ? query :
      query.then(result => result.toObject());
  }

  update(id: TPrimaryKey, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(
      id,
      data,
      {
        ...this._sharedQueryOptions,
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

  private get _sharedQueryOptions() {
    return {
      translateAliases: true,
      lean: this._autoLeanOptions,
    };
  };

  private get _autoLeanOptions() {
    if (this._noAutoLean) return undefined;

    return {
      getters: true,
      defaults: true,
      virtuals: true,
    };
  }
  private get _noAutoLean() { return this.options.noAutoLean; }
}
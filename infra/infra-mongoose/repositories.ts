import { IBaseRepository } from '@omniflex/core/types';
import { Model, Document, FilterQuery } from 'mongoose';

export class MongooseBaseRepository<T extends Document, TPrimaryKey = string>
  implements IBaseRepository<T, TPrimaryKey> {
  constructor(
    protected readonly model: Model<T>,
    public noLean: boolean = false,
  ) { }

  getModel() {
    return this.model;
  }

  requireLean() {
    return new MongooseBaseRepository(this.model, true);
  }

  optionalLean() {
    return new MongooseBaseRepository(this.model, false);
  }

  async exists(filter: Partial<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter as FilterQuery<T>);

    return count > 0;
  }

  findById(id: TPrimaryKey): Promise<T | null> {
    const query = this.model.findById(id);

    return this.noLean ? query : query.lean<T>();
  }

  findOne(filter: Partial<T>): Promise<T | null> {
    const query = this.model.findOne(filter as FilterQuery<T>);

    return this.noLean ? query : query.lean<T>();
  }

  find(
    filter: Partial<T>,
    options?: { skip?: number; take?: number; }
  ): Promise<T[]> {
    const query = this.model.find(filter as FilterQuery<T>);

    if (options?.skip !== undefined) {
      query.skip(options.skip);
    }

    if (options?.take !== undefined) {
      query.limit(options.take);
    }

    return this.noLean ? query : query.lean<T[]>();
  }

  create(data: Partial<T>): Promise<T> {
    const query = this.model.create(data);

    return this.noLean ? query :
      query.then(result => result.toObject());
  }

  update(id: TPrimaryKey, data: Partial<T>): Promise<T | null> {
    const query = this.model.findByIdAndUpdate(id, data, { new: true });

    return this.noLean ? query : query.lean<T>();
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
import { IBaseRepository } from '@omniflex/core/types';
import { Model, Document, FilterQuery } from 'mongoose';

export class MongooseBaseRepository<T extends Document, TPrimaryKey = string>
  implements IBaseRepository<T, TPrimaryKey> {
  constructor(protected readonly model: Model<T>) { }

  async exists(filter: Partial<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter as FilterQuery<T>);

    return count > 0;
  }

  findById(id: TPrimaryKey): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  findOne(filter: Partial<T>): Promise<T | null> {
    return this.model.findOne(filter as FilterQuery<T>).exec();
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

    return query.exec();
  }

  create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  update(id: TPrimaryKey, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: TPrimaryKey): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();

    return !!result;
  }

  async softDelete(id: TPrimaryKey): Promise<boolean> {
    const result = await this.model.findByIdAndUpdate(id, { isDeleted: true }).exec();

    return !!result;
  }
}
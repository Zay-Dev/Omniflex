import { Model } from 'mongoose';
import { BaseRepository } from './base';

type TKeyOfFn<T> = keyof {
  [P in keyof T as T[P] extends (...args) => any ? P : never]: any
};

type TModelFnParams<
  T,
  K extends TKeyOfFn<Model<T>>
> = Parameters<(Model<T>)[K]>;

export class RawRepository<T> extends BaseRepository<T> {
  async exists(
    filter: TModelFnParams<T, 'countDocuments'>[0],
  ) {
    const count = await this.model.countDocuments(filter);

    return count > 0;
  }

  findById(
    id: TModelFnParams<T, 'findById'>[0],
  ) {
    return this.model.findById(
      id,
      null,
      this.sharedQueryOptions,
    );
  }

  findOne(
    filter: TModelFnParams<T, 'findOne'>[0],
  ) {
    return this.model.findOne(
      filter,
      null,
      this.sharedQueryOptions,
    );
  }

  find(
    filter: Exclude<TModelFnParams<T, 'findOne'>[0], undefined>,
    options?: { skip?: number; take?: number; },
  ) {
    const query = this.model.find(
      filter,
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

  create(
    data: TModelFnParams<T, 'create'>[0],
  ) {
    const query = this.model.create(data);

    return this.noAutoLean ? query :
      query.then(result => result.toObject());
  }

  update(
    id: TModelFnParams<T, 'findByIdAndUpdate'>[0],
    data: TModelFnParams<T, 'findByIdAndUpdate'>[1],
  ) {
    return this.model.findByIdAndUpdate(
      id,
      data,
      {
        ...this.sharedQueryOptions,
        new: true,
      }
    );
  }

  async delete(
    id: TModelFnParams<T, 'findByIdAndDelete'>[0],
  ) {
    const result = await this.model.findByIdAndDelete(id);

    return !!result;
  }

  async softDelete(
    id: TModelFnParams<T, 'findByIdAndUpdate'>[0],
  ) {
    const result = await this.model
      .findByIdAndUpdate(id, { deletedAt: new Date() });

    return !!result;
  }
}
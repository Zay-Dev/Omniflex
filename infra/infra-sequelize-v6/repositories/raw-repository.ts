import { TModel, BaseRepository } from './base';

import {
  Model,
  Identifier,
  Attributes,
  CreationAttributes,
} from 'sequelize';

type TKeyOfFn<T> = keyof {
  [P in keyof T as T[P] extends (...args) => any ? P : never]: any
};

type TModelFnParams<
  T extends Model,
  K extends TKeyOfFn<TModel<T>>
> = Parameters<TModel<T>[K]>;

export class RawRepository<
  T extends { id: TPrimaryKey; },
  TPrimaryKey extends Identifier = string
> extends BaseRepository<T> {
  async exists(
    options: TModelFnParams<Model<T>, 'count'>[0],
  ): Promise<boolean> {
    const count = await this.model.count(options);

    return count > 0;
  }

  findById(id: TPrimaryKey) {
    return this.model.findByPk(id, this.sharedQueryOptions);
  }

  findOne(filter: TModelFnParams<Model<T>, 'findOne'>[0]) {
    return this.model.findOne({
      ...this.sharedQueryOptions,
      ...filter,
    });
  }

  find(options: TModelFnParams<Model<T>, 'findAll'>[0]) {
    return this.model.findAll({
      ...this.sharedQueryOptions,
      ...options,
    });
  }

  async create(data: CreationAttributes<Model<T>>) {
    const instance = await this.model.create(data, this.sharedQueryOptions);

    return instance;
  }

  async update(
    id: TPrimaryKey,
    data: Attributes<Model<T>>,
  ) {
    await this.model.update(data, {
      where: { id: id as any },
      ...this.sharedQueryOptions,
    });
    return this.findById(id);
  }

  async delete(id: TPrimaryKey) {
    const result = await this.model
      .destroy({ where: { id: id as any } });

    return result > 0;
  }

  async softDelete(id: TPrimaryKey) {
    return this.update(id, { isDeleted: true } as any);
  }
}
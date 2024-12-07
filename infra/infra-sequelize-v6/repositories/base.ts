import { Model, ModelStatic } from 'sequelize';

export type TModel<T extends Model> = ModelStatic<T>;

export abstract class BaseRepository<T extends {}> {
  protected options: {
    raw: boolean;
  };

  constructor(
    protected readonly model: ModelStatic<Model<T>>,
    options?: {
      raw?: boolean;
    },
  ) {
    this.options = {
      raw: options?.raw || false,
    };
  }

  getModel() {
    return this.model;
  }

  useAutoRaw() {
    return this.newInstance({
      ...this.options,
      raw: true,
    });
  }

  useSkipAutoRaw() {
    return this.newInstance({
      ...this.options,
      raw: false,
    });
  }

  protected get sharedQueryOptions() {
    return {
      raw: this.options.raw,
    };
  }

  protected newInstance(
    options?: {
      raw?: boolean;
    },
  ): this {
    return new (this.constructor as any)(this.model, options);
  }
}
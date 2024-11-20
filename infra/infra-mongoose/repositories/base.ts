import { Model } from 'mongoose';

export abstract class BaseRepository<T> {
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

    (['toJSON', 'toObject'] as const)
      .forEach((method) => {
        const current = model.schema.get(method);

        model.schema.set(method, {
          ...(current || {}),
          ...(this.autoLeanOptions || {}),
        });
      });
  }

  getModel() {
    return this.model;
  }

  useAutoLean() {
    return this.newInstance({
      ...this.options,
      noAutoLean: false,
    });
  }

  useSkipAutoLean() {
    return this.newInstance({
      ...this.options,
      noAutoLean: true,
    });
  }

  protected get sharedQueryOptions() {
    return {
      translateAliases: true,
      lean: this.autoLeanOptions,
    };
  };

  protected get autoLeanOptions() {
    if (this.noAutoLean) return undefined;

    return {
      getters: true,
      defaults: true,
      virtuals: true,
    };
  }
  protected get noAutoLean() { return this.options.noAutoLean; }

  protected newInstance(
    options?: {
      noAliasId?: boolean;
      noAutoLean?: boolean;
    },
  ): this {
    return new (this.constructor as any)(this.model, options);
  }
}
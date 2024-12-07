export type TSoftDeletable = {
  deletedAt: Date | null;
};

export type TWithTimestamps = {
  createdAt: Date;
  updatedAt: Date;
};

export type TQueryOperators<T> = {
  $eq?: T;
  $ne?: T;
  $gt?: T;
  $gte?: T;
  $lt?: T;
  $lte?: T;
  $in?: T[];
  $nin?: T[];
  $regex?: string | RegExp;
  $options?: string;
};

export type TQueryCondition<T> = T | TQueryOperators<T>;

export type TDeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ?
  TDeepPartial<T[P]> | TQueryCondition<T[P]> : TQueryCondition<T[P]>
};

export type TPopulateOption<T, K = T> = {
  path: keyof T;
  select?: string | Array<keyof K>;
  populate?: string | Array<keyof K> | TPopulateOption<K>;
  paranoid?: boolean;
};

export type TQueryOptions<T> = {
  select?: Array<keyof T> | string;
  populate?: Array<keyof T | TPopulateOption<T, any>> | string | TPopulateOption<T, any>;
  skip?: number;
  take?: number;
  sort?: {
    [P in keyof T]?: 'asc' | 'desc'
  };
  paranoid?: boolean;
};

export interface IBaseRepository<T, TPrimaryKey> {
  isValidPrimaryKey(id: TPrimaryKey): boolean;

  exists(filter: TDeepPartial<T>): Promise<boolean>;

  findById(id: TPrimaryKey, options?: TQueryOptions<T>): Promise<T | null>;
  findOne(filter: TDeepPartial<T>, options?: TQueryOptions<T>): Promise<T | null>;
  find(filter: TDeepPartial<T>, options?: TQueryOptions<T>): Promise<T[]>;

  create(data: Partial<T>): Promise<T>;
  updateById(id: TPrimaryKey, data: Partial<T>): Promise<T | null>;
  updateMany(filter: TDeepPartial<T>, data: Partial<T>): Promise<number>;

  delete(id: TPrimaryKey): Promise<boolean>;
  softDelete(id: TPrimaryKey): Promise<boolean>;
}
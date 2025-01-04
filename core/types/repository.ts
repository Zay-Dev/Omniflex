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
  $regex?: RegExp;
};

export type TQueryCondition<T> = T | TQueryOperators<T>;

export type TQueryFilter<T> = {
  [P in keyof T]?: TQueryCondition<T[P]>;
};

export type TQueryOptions<T> = {
  skip?: number;
  take?: number;
  sort?: {
    [P in keyof T]?: 'asc' | 'desc';
  };
  paranoid?: boolean;
};

export interface IBaseRepository<T, TPrimaryKey> {
  isValidPrimaryKey(id: TPrimaryKey): boolean;
  
  // Read operations
  exists(filter: TQueryFilter<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<boolean>;
  count(filter: TQueryFilter<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<number>;
  
  findById(id: TPrimaryKey, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null>;
  findOne(filter: TQueryFilter<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null>;
  find(filter: TQueryFilter<T>, options?: TQueryOptions<T>): Promise<T[]>;
  
  // Create operation
  create(data: Partial<T>): Promise<T>;
  
  // Update operations
  updateById(id: TPrimaryKey, data: Partial<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null>;
  updateOne(filter: TQueryFilter<T>, data: Partial<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null>;
  update(filter: TQueryFilter<T>, data: Partial<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<number>;
  
  // Hard delete operations
  deleteById(id: TPrimaryKey): Promise<boolean>;
  deleteOne(filter: TQueryFilter<T>): Promise<boolean>;
  delete(filter: TQueryFilter<T>): Promise<number>;
  
  // Soft delete operations
  softDeleteById(id: TPrimaryKey): Promise<boolean>;
  softDeleteOne(filter: TQueryFilter<T>): Promise<boolean>;
  softDelete(filter: TQueryFilter<T>): Promise<number>;
}
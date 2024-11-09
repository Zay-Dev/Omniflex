export type TSoftDeletable = {
  isDeleted: boolean;
};

export type TWithTimestamps = {
  createdAt: Date;
  updatedAt: Date;
};

export interface IBaseRepository<T, TPrimaryKey> {
  exists(filter: Partial<T>): Promise<boolean>;

  findById(id: TPrimaryKey): Promise<T | null>;
  findOne(filter: Partial<T>): Promise<T | null>;
  find(filter: Partial<T>, options?: { skip?: number; take?: number; }): Promise<T[]>;

  create(data: Partial<T>): Promise<T>;
  update(id: TPrimaryKey, data: Partial<T>): Promise<T | null>;

  delete(id: TPrimaryKey): Promise<boolean>;
  softDelete(id: TPrimaryKey): Promise<boolean>;
}
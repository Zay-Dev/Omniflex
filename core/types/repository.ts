export interface IBaseRepository<T, TPrimaryKey> {
  findById(id: TPrimaryKey): Promise<T | null>;
  findOne(filter: Partial<T>): Promise<T | null>;
  find(filter: Partial<T>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: TPrimaryKey, data: Partial<T>): Promise<T | null>;
  delete(id: TPrimaryKey): Promise<boolean>;
  softDelete(id: TPrimaryKey): Promise<boolean>;
}
import { PrismaClient } from './prisma-client';
import { IBaseRepository } from '@omniflex/core/types/repository';

export { PrismaClient } from './prisma-client';

export type TEntityWithId = { id: string; };

export class PrismaBaseRepository<
  TEntity extends { id: TPrimaryKey; },
  TPrimaryKey = string
>
  implements IBaseRepository<TEntity, TPrimaryKey> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly model: string
  ) { }

  protected get delegate() {
    return this.prisma[this.model];
  }

  async exists(filter: Partial<TEntity>): Promise<boolean> {
    const count = await this.delegate.count({ where: filter });

    return count > 0;
  }

  async findById(id: TPrimaryKey): Promise<TEntity | null> {
    return this.delegate.findUnique({ where: { id } });
  }

  async findOne(filter: Partial<TEntity>): Promise<TEntity | null> {
    return this.delegate.findFirst({ where: filter });
  }

  async find(
    filter: Partial<TEntity>,
    options?: { skip?: number; take?: number }
  ): Promise<TEntity[]> {
    return this.delegate.findMany({
      where: filter,
      skip: options?.skip,
      take: options?.take
    });
  }

  async create(data: Partial<TEntity>): Promise<TEntity> {
    return this.delegate.create({ data });
  }

  async update(id: TPrimaryKey, data: Partial<TEntity>): Promise<TEntity | null> {
    return this.delegate.update({
      where: { id },
      data
    });
  }

  async delete(id: TPrimaryKey): Promise<boolean> {
    try {
      await this.delegate.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async softDelete(id: TPrimaryKey): Promise<boolean> {
    try {
      await this.delegate.update({
        where: { id },
        data: { isDeleted: true }
      });
      return true;
    } catch {
      return false;
    }
  }
}
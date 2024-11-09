import { PrismaClient } from '@prisma/client';
import { IBaseRepository } from '@omniflex/core/types/repository';

export abstract class PrismaBaseRepository<T extends { id: TPrimaryKey }, TPrimaryKey = string>
implements IBaseRepository<T, TPrimaryKey> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly model: string
  ) {}

  protected get delegate() {
    return this.prisma[this.model];
  }

  async findById(id: TPrimaryKey): Promise<T | null> {
    return this.delegate.findUnique({ where: { id } });
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    return this.delegate.findFirst({ where: filter });
  }

  async find(filter: Partial<T>): Promise<T[]> {
    return this.delegate.findMany({ where: filter });
  }

  async create(data: Partial<T>): Promise<T> {
    return this.delegate.create({ data });
  }

  async update(id: TPrimaryKey, data: Partial<T>): Promise<T | null> {
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
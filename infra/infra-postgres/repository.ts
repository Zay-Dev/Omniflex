import { Identifier } from 'sequelize';
import { IBaseRepository } from '@omniflex/core/types/repository';
import { SequelizeRepository } from '@omniflex/infra-sequelize-v6';

export class PostgresRepository<
  T extends { id: TPrimaryKey; },
  TPrimaryKey extends Identifier = string
>
  extends SequelizeRepository<T, TPrimaryKey>
  implements IBaseRepository<T, TPrimaryKey> {
}
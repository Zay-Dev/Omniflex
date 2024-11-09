import {
  TUserPassword,
  IUserPasswordRepository,
} from '@omniflex/module-identity-core/types';

import {
  PrismaClient,
  PrismaBaseRepository,
} from '@omniflex/infra-prisma';

type TPrismaUserPassword = TUserPassword & {};

export class UserPasswordRepository
  extends PrismaBaseRepository<TPrismaUserPassword>
  implements IUserPasswordRepository {

  constructor(prisma: PrismaClient) {
    super(prisma, 'userPassword')
  }

  async findByUsername(username: string) {
    return this.findOne({ username, isDeleted: false })
  }
}
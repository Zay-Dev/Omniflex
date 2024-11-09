import {
  TUserPassword,
  IUserPasswordRepository,
} from '@omniflex/module-identity-core/types';

import {
  PrismaClient,
  PrismaBaseRepository,
} from '@omniflex/infra-prisma';

type TPrismaUserPassword = TUserPassword & {
  id: string;
};

export class UserPasswordRepository
  extends PrismaBaseRepository<TPrismaUserPassword>
  implements IUserPasswordRepository<string> {

  constructor(prisma: PrismaClient) {
    super(prisma, 'userPassword')
  }

  async findByUsername(username: string) {
    return this.findOne({ username, isDeleted: false })
  }
}
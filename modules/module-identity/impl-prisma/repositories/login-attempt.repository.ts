import {
  TUser,
  TLoginAttempt,
  ILoginAttemptRepository,
} from '@omniflex/module-identity-core/types';

import {
  TEntityWithId,
  PrismaClient,
  PrismaBaseRepository,
} from '@omniflex/infra-prisma';

type TPrismaLoginAttempt = TLoginAttempt & {
  userId: string;
};

export class LoginAttemptRepository
  extends PrismaBaseRepository<TPrismaLoginAttempt>
  implements ILoginAttemptRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'loginAttempt');
  }

  async findByUser(user: TUser & TEntityWithId) {
    return this.find({ userId: user.id, isDeleted: false });
  }
}
import {
  TUser,
  TUserProfile,
  IUserProfileRepository,
} from '@omniflex/module-identity-core/types';

import {
  TEntityWithId,
  PrismaClient,
  PrismaBaseRepository,
} from '@omniflex/infra-prisma';

type TPrismaUserProfile = TUserProfile & {
  id: string;
  userId: string
}

export class UserProfileRepository
  extends PrismaBaseRepository<TPrismaUserProfile>
  implements IUserProfileRepository<string> {

  constructor(prisma: PrismaClient) {
    super(prisma, 'userProfile')
  }

  async findByUser(user: TUser & TEntityWithId) {
    return this.findOne({ userId: user.id, isDeleted: false })
  }

  async findByEmail(email: string) {
    return this.findOne({ email, isDeleted: false })
  }
}
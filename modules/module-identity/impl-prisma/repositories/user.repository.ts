import {
  TUser,
  IUserRepository,
} from '@omniflex/module-identity-core/types'

import {
  PrismaClient,
  PrismaBaseRepository,
} from '@omniflex/infra-prisma';

type TPrismaUser = TUser & {
  id: string;
};

export class UserRepository
  extends PrismaBaseRepository<TPrismaUser>
  implements IUserRepository<string> {

  constructor(prisma: PrismaClient) {
    super(prisma, 'user')
  }

  async findByIdentifier(identifier: string) {
    return this.findOne({ identifier, isDeleted: false })
  }

  async findByUsername(username: string) {
    const password = await this.prisma.userPassword.findFirst({
      where: { username, isDeleted: false },
      include: { user: true }
    })
    return password?.user || null
  }

  async findByEmail(email: string) {
    const profile = await this.prisma.userProfile.findFirst({
      where: { email, isDeleted: false },
      include: { user: true }
    })
    return profile?.user || null
  }
}
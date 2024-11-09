import { IBaseRepository } from '@omniflex/core/types/repository';

export type TUser = {
  isDeleted: boolean;
  isVerified: boolean;
  identifier: string;
  lastSignInAtUtc?: Date;
};

export type TUserProfile = {
  user: TUser;
  isDeleted: boolean;
  profileImage?: string;
  email?: string;
  mobileNumber?: string;
  firstName?: string;
  lastName?: string;
  profile?: any;
};

export type TUserPassword = {
  user: TUser;
  isDeleted: boolean;
  username: string;
  hashedPassword: string;
};

export type TLoginAttempt = {
  user: TUser;
  isDeleted: boolean;
  identifier: string;
  loginType: string;
  appType: string;
  success: boolean;
  ipAddress?: string;
  remark?: any;
};

export interface IUserRepository<TPrimaryKey>
  extends IBaseRepository<TUser, TPrimaryKey> {
  findByIdentifier(identifier: string): Promise<TUser | null>;
  findByUsername(username: string): Promise<TUser | null>;
  findByEmail(email: string): Promise<TUser | null>;
}

export interface IUserProfileRepository<TPrimaryKey>
  extends IBaseRepository<TUserProfile, TPrimaryKey> {
  findByUser(user: TUser): Promise<TUserProfile | null>;
  findByEmail(email: string): Promise<TUserProfile | null>;
}

export interface IUserPasswordRepository<TPrimaryKey>
  extends IBaseRepository<TUserPassword, TPrimaryKey> {
  findByUsername(username: string): Promise<TUserPassword | null>;
}

export interface ILoginAttemptRepository<TPrimaryKey>
  extends IBaseRepository<TLoginAttempt, TPrimaryKey> {
  findByUser(user: TUser): Promise<TLoginAttempt[]>;
}
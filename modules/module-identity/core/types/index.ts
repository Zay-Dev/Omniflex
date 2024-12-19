import { IBaseRepository, TSoftDeletable, TWithTimestamps } from '@omniflex/core/types/repository';

export type TUser = TSoftDeletable & TWithTimestamps & {
  id: string;
  isVerified: boolean;
  identifier: string;
  lastSignInAtUtc: Date | null;
};

export type TUserProfile = TSoftDeletable & TWithTimestamps & {
  id: string;

  profileImage?: string;
  email?: string;
  mobileNumber?: string;
  firstName?: string;
  lastName?: string;
  profile?: any;

  user: TUser;
  userId: string;
};

export type TUserPassword = TSoftDeletable & TWithTimestamps & {
  id: string;

  salt: string;
  username: string;
  hashedPassword: string;

  user: TUser;
  userId: string;
};

export type TLoginAttempt = TSoftDeletable & TWithTimestamps & {
  id: string;

  identifier: string;
  loginType: string;
  appType: string;
  success: boolean;
  remoteAddress?: string;
  remark?: any;

  user?: TUser;
  userId?: string;
};

export interface IUserRepository<T extends TUser = TUser>
  extends IBaseRepository<T, string> {
}

export interface IUserProfileRepository
  extends IBaseRepository<TUserProfile, string> {
}

export interface IUserPasswordRepository
  extends IBaseRepository<TUserPassword, string> {
  findByUsername(username: string): Promise<TUserPassword | null>;
}

export interface ILoginAttemptRepository
  extends IBaseRepository<TLoginAttempt, string> {
} 
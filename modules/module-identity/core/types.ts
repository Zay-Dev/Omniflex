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
  ipAddress?: string;
  remark?: any;

  user?: TUser;
  userId?: string;
};

export interface IUserRepository<T extends TUser = TUser>
  extends IBaseRepository<T, string> {
  findByIdentifier(identifier: string): Promise<T | null>;
  findByUsername(username: string): Promise<T | null>;
  findByEmail(email: string): Promise<T | null>;
}

export interface IUserProfileRepository
  extends IBaseRepository<TUserProfile, string> {
  findByUser(user: TUser): Promise<TUserProfile | null>;
  findByEmail(email: string): Promise<TUserProfile | null>;
}

export interface IUserPasswordRepository
  extends IBaseRepository<TUserPassword, string> {
  findByUsername(username: string): Promise<TUserPassword | null>;
}

export interface ILoginAttemptRepository
  extends IBaseRepository<TLoginAttempt, string> {
  findByUser(user: TUser): Promise<TLoginAttempt[]>;
}
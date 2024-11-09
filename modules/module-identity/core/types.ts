import { IBaseRepository, TSoftDeletable, TWithTimestamps } from '@omniflex/core/types/repository';

export type TUser = TSoftDeletable & TWithTimestamps & {
  id: string;
  isVerified: boolean;
  identifier: string;
  lastSignInAtUtc: Date | null;
};

export type TUserProfile = TSoftDeletable & TWithTimestamps & {
  id: string;
  user: TUser;
  profileImage?: string;
  email?: string;
  mobileNumber?: string;
  firstName?: string;
  lastName?: string;
  profile?: any;
};

export type TUserPassword = TSoftDeletable & TWithTimestamps & {
  id: string;
  user: TUser;
  username: string;
  hashedPassword: string;
};

export type TLoginAttempt = TSoftDeletable & TWithTimestamps & {
  id: string;
  user: TUser;
  identifier: string;
  loginType: string;
  appType: string;
  success: boolean;
  ipAddress?: string;
  remark?: any;
};

export interface IUserRepository
  extends IBaseRepository<TUser, string> {
  findByIdentifier(identifier: string): Promise<TUser | null>;
  findByUsername(username: string): Promise<TUser | null>;
  findByEmail(email: string): Promise<TUser | null>;
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
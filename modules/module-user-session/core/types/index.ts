import { IBaseRepository, TSoftDeletable, TWithTimestamps } from '@omniflex/core/types/repository';

export type TUserSession = TSoftDeletable & TWithTimestamps & {
  id: string;
  userId: string;
  sessionType: string;

  expiredAt: Date;
  isActive: boolean;
  identifier: string;
  pairIdentifier: string;

  metadata?: any;
  deviceInfo?: any;
  userAgent?: string;
  remoteAddress?: string;
};

export interface IUserSessionRepository extends IBaseRepository<TUserSession, string> {
  deactivateByUserId(userId: string): Promise<void>;
  deactivateBySessionType(userId: string, sessionType: string): Promise<void>;
}

export type TBodyRefreshToken = {
  refreshToken: string;
};

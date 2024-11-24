import { IBaseRepository, TSoftDeletable, TWithTimestamps } from '@omniflex/core/types/repository';

export type TUserSession = TSoftDeletable & TWithTimestamps & {
  id: string;
  sessionType: string;
  isActive: boolean;
  expiredAt: Date;
  userId: string;

  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: any;
  metadata?: any;
};

export interface IUserSessionRepository extends IBaseRepository<TUserSession, string> {
  deactivateByUserId(userId: string): Promise<void>;
  deactivateBySessionType(userId: string, sessionType: string): Promise<void>;
}
import { v4 as uuid } from 'uuid';
import { errors } from '@omniflex/core';
import { resolve } from '../containers';

export class UserSessionService {
  static getCreateSession(userId, {
    metadata,
    userAgent,
    deviceInfo,
    remoteAddress,
  }) {
    const pairIdentifier = uuid();
    const { sessions } = resolve();

    const base = {
      userId,
      pairIdentifier,

      metadata,
      userAgent,
      deviceInfo,
      remoteAddress,

      isActive: true,
    };

    return async (sessionType: string, expiresInMs: number) => {
      const identifier = uuid();
      const expiredAt = new Date(Date.now() + expiresInMs);

      return await sessions.create({
        ...base,

        expiredAt,
        identifier,
        sessionType,
      });
    };
  }

  static async inactivateByPairIdentifier(pairIdentifier: string) {
    await resolve().sessions
      .updateMany({ pairIdentifier }, { isActive: false });
  }

  static async throwIfInvalidSession(identifier: string) {
    if (!identifier) throw errors.unauthorized();

    const sessions = resolve().sessions;
    const session = await sessions.exists({
      identifier,
      isActive: true,
      isDeleted: false,
      expiredAt: { $gt: new Date() },
    });

    if (!session) throw errors.unauthorized();
  }
}
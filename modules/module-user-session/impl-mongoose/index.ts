import { Connection } from 'mongoose';
import { Containers } from '@omniflex/core';
import { registerRepositories } from '@omniflex/module-user-session-core';

import * as Schemas from './schemas';
import { UserSessionRepository } from './repositories/user-session.repository';

export * from './schemas';
export * from './repositories/user-session.repository';

function get<T>(fn: () => T) { return fn(); }

const appContainer = Containers.appContainerAs<{ mongoose: Connection; }>();

export const repositories = {} as {
  sessions: UserSessionRepository;
};

export const createRegisteredRepositories = (
  sessionSchema = get(Schemas.getSessionSchema),
) => {
  const mongoose = appContainer.resolve('mongoose');

  const sessionModel = mongoose.model('UserSessions', sessionSchema);

  repositories.sessions = new UserSessionRepository(sessionModel);

  registerRepositories({
    userSessionRepository: repositories.sessions,
  });
};
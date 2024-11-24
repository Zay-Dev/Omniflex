import { Sequelize } from 'sequelize';
import { Containers } from '@omniflex/core';
import { registerRepositories } from '@omniflex/module-user-session-core';

import * as Schemas from './schemas';
import { UserSessionRepository } from './repositories/user-session.repository';

export * from './schemas';
export * from './repositories/user-session.repository';

function get<T>(fn: () => T) { return fn(); }

const appContainer = Containers.appContainerAs<{ postgres: Sequelize; }>();

export const repositories = {} as {
  sessions: UserSessionRepository;
};

export const createRegisteredRepositories = (
  sessionSchema = get(Schemas.getSessionSchema),
) => {
  const postgres = appContainer.resolve('postgres');

  const sessionModel = postgres.define('UserSession', sessionSchema.schema, sessionSchema.options);

  repositories.sessions = new UserSessionRepository(sessionModel);

  registerRepositories({
    userSessionRepository: repositories.sessions,
  });
};
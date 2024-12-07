import { Sequelize } from 'sequelize';
import { Containers } from '@omniflex/core';
import { registerRepositories } from '@omniflex/module-user-session-core';

import * as Schemas from './schemas';
import { UserSessionRepository } from './repositories/user-session.repository';

export * from './schemas';
export * from './repositories/user-session.repository';

type TContainer = { sequelize: Sequelize; };

function get<T>(fn: () => T) { return fn(); }

export const appContainer = Containers.appContainerAs<TContainer>();

export const repositories = {} as {
  sessions: UserSessionRepository;
};

export const createRegisteredRepositories = (
  sessionSchema = get(Schemas.getSessionSchema),
) => {
  const sequelize = appContainer.resolve('sequelize');

  const sessionModel = sequelize.define(
    'UserSession',
    sessionSchema.schema,
    sessionSchema.options,
  );

  repositories.sessions = new UserSessionRepository(sessionModel);

  registerRepositories({
    userSessionRepository: repositories.sessions,
  });
};
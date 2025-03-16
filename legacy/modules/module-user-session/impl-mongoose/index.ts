import { registerRepositories } from '@omniflex/module-user-session-core';

import * as UserSessions from './schemas/user-sessions';

const models = {
  userSessions: null as any,
};

export const createRegisteredRepositories = (
  userSessionSchemaOrDefinition?: Parameters<typeof UserSessions.createRepository>[0],
) => {
  const userSessions = UserSessions.createRepository(userSessionSchemaOrDefinition);

  registerRepositories({
    userSessionRepository: userSessions,
  });

  models.userSessions = userSessions.getModel();
};
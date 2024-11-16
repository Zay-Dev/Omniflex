import { errors } from '@omniflex/core';
import { resolve } from '../containers';

const repositories = resolve();

export const throwIfConflictingUsername = async ({ username }) => {
  const userExists = await repositories.users.exists({
    isDeleted: false,
    identifier: username,
  });

  if (userExists) throw errors.conflict();

  const passwordExists = await repositories.passwords.exists({
    username,
    isDeleted: false,
  });

  if (passwordExists) throw errors.conflict();
};

export const throwIfConflictingEmail = async ({ email }) => {
  throwIfConflictingUsername({ username: email });
};
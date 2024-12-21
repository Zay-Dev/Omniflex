import { Request, Response, NextFunction } from 'express';
import { tryValidateBody } from '@omniflex/infra-express/helpers/joi';

import { errors } from '@omniflex/core';
import * as Rules from '@omniflex/module-identity-core/user.rules';
import { tryAction } from '@omniflex/infra-express/utils/try-action';

import {
  resolve,
  schemaLogin,
  schemaRegister,
  schemaLoginWithEmail,
  schemaRegisterWithEmail,
} from '@omniflex/module-identity-core';

export const validateRegister = [
  tryValidateBody(schemaRegister),
  tryAction((req) => Rules.throwIfConflictingUsername(req.body)),
];

export const validateRegisterWithEmail = [
  tryValidateBody(schemaRegisterWithEmail),
  tryAction((req) => Rules.throwIfConflictingEmail(req.body)),
];

const getValidateLogin = (schema: any, usernameKey: string) => [
  tryValidateBody(schema),
  tryAction(async (req) => {
    const { passwords } = resolve();
    const found = await passwords.exists({
      username: req.body[usernameKey],
    });

    if (!found) {
      throw errors.unauthorized();
    }
  }),
];

export const validateLogin = getValidateLogin(schemaLogin, 'username');
export const validateLoginWithEmail = getValidateLogin(schemaLoginWithEmail, 'email');
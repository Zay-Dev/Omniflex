import { tryValidateBody } from '@omniflex/infra-express/helpers/joi';

import { errors } from '@omniflex/core';
import { ExpressUtils } from '@omniflex/infra-express';
import * as Rules from '@omniflex/module-identity-core/user.rules';

import {
  resolve,
  schemaLogin,
  schemaRegister,
  schemaLoginWithEmail,
  schemaRegisterWithEmail,
} from '@omniflex/module-identity-core';

export const validateRegister = [
  tryValidateBody(schemaRegister),
  ExpressUtils.tryAction((req) => Rules.throwIfConflictingUsername(req.body)),
];

export const validateRegisterWithEmail = [
  tryValidateBody(schemaRegisterWithEmail),
  ExpressUtils.tryAction((req) => Rules.throwIfConflictingEmail(req.body)),
];

const getValidateLogin = (schema: any, usernameKey: string) => [
  tryValidateBody(schema),
  ExpressUtils.tryAction(async (req) => {
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
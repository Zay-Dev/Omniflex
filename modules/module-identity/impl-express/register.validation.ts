import { Request, Response, NextFunction } from 'express';
import { tryValidateBody } from '@omniflex/infra-express/helpers/joi';

import { errors } from '@omniflex/core';
import { resolve } from '@omniflex/module-identity-core/containers';

import * as Rules from '@omniflex/module-identity-core/user.rules';
import { schemas } from '@omniflex/module-identity-core/user.schema';

export const validateRegister = [
  tryValidateBody(schemas.register),

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      Rules.throwIfConflictingUsername(req.body);
    } catch (error) {
      return next(error);
    }

    return next();
  },
];

export const validateRegisterWithEmail = [
  tryValidateBody(schemas.registerWithEmail),

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Rules.throwIfConflictingEmail(req.body);
    } catch (error) {
      return next(error);
    }

    return next();
  },
];

const getValidateLogin = (schema: any, usernameKey: string) => [
  tryValidateBody(schema),

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { passwords } = resolve();
      const found = await passwords.exists({
        username: req.body[usernameKey],
      });

      if (!found) {
        throw errors.unauthorized();
      }
    } catch (error) {
      return next(error);
    }

    return next();
  },
];

export const validateLogin = getValidateLogin(schemas.login, 'username');
export const validateLoginWithEmail = getValidateLogin(schemas.loginWithEmail, 'email');
import { Request, Response, NextFunction } from 'express';
import { validateRequestBody } from '@omniflex/infra-express/helpers/joi';

import { errors } from '@omniflex/core';
import { resolve } from '@omniflex/module-identity-core/containers';

import * as Rules from '@omniflex/module-identity-core/user.rules';
import { schemas } from '@omniflex/module-identity-core/user.schema';

export const validateRegister = [
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      validateRequestBody(req, schemas.register);
    } catch (error) {
      return next(error);
    }

    return next();
  },

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
  (req: Request, res: Response, next: NextFunction) => {
    try {
      validateRequestBody(req, schemas.registerWithEmail);
    } catch (error) {
      return next(error);
    }

    return next();
  },

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
  (req: Request, res: Response, next: NextFunction) => {
    try {
      validateRequestBody(req, schema);
    } catch (error) {
      return next(error);
    }

    return next();
  },

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
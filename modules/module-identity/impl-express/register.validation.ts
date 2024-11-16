import { Request, Response, NextFunction } from 'express';
import { validateRequestBody } from '@omniflex/infra-express/helpers/joi';

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
import { errors } from '@omniflex/core';
import { validateRequestBody } from '@omniflex/infra-express/helpers/joi';
import { Request, Response, NextFunction } from '@omniflex/infra-express/types';

import * as Rules from '@omniflex/module-identity-core/validation/user.rules';
import { schemas } from '@omniflex/module-identity-core/validation/user.schema';

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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      validateRequestBody(req, schemas.registerWithEmail);
    } catch (error) {
      return next(error);
    }

    return next();
  },

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      Rules.throwIfConflictingEmail(req.body);
    } catch (error) {
      return next(error);
    }

    return next();
  },
];
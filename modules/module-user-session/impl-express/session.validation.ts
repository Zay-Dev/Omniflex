import { Request, Response, NextFunction } from 'express';
import { validateRequestBody } from '@omniflex/infra-express/helpers/joi';
import { schemas } from '@omniflex/module-user-session-core/session.schema';

export const validateRefreshToken = [
  (req: Request, res: Response, next: NextFunction) => {
    try {
      validateRequestBody(req, schemas.refreshToken);
    } catch (error) {
      return next(error);
    }

    return next();
  },
];
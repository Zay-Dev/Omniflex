import { Request, Response, NextFunction } from 'express';
import { tryValidateBody } from '@omniflex/infra-express/helpers/joi';
import { schemas } from '@omniflex/module-user-session-core/session.schema';

export const validateRefreshToken = [
  tryValidateBody(schemas.refreshToken),
];
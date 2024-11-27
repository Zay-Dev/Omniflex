import Joi from 'joi';
import j2s from 'joi-to-swagger';
import { modulesSchemas } from '@omniflex/core';

export type TBodyRefreshToken = {
  refreshToken: string;
};

const schemaRefreshToken = Joi.object<TBodyRefreshToken>({
  refreshToken: Joi.string().required(),
}).unknown();

export const schemas = {
  refreshToken: schemaRefreshToken,
};

modulesSchemas.moduleUserSession = {
  refreshToken: {
    ...j2s(schemaRefreshToken).swagger,
    example: {
      refreshToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    } as TBodyRefreshToken,
  },
};

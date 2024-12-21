import Joi from 'joi';
import j2s from 'joi-to-swagger';
import { modulesSchemas } from '@omniflex/core';

import * as Base from './_base';
import * as Types from '../types';

export const schemaLogin = Joi.object<Types.TBodyLogin>({
  ...Base.baseLoginSchema,

  username: Joi.string().trim().required(),
}).unknown();

export const schemaLoginWithEmail = Joi.object<Types.TBodyLoginWithEmail>({
  ...Base.baseLoginSchema,

  email: Base.email.required(),
}).unknown();

modulesSchemas.moduleIdentityLogin = {
  ...j2s(schemaLogin).swagger,
  example: {
    username: 'username',
    password: 'P@ssword12#',
  } as Types.TBodyLogin,
};

modulesSchemas.moduleIdentityLoginWithEmail = {
  ...j2s(schemaLoginWithEmail).swagger,
  example: {
    email: 'license@omniflex.io',
    password: 'P@ssword12#',
  } as Types.TBodyLoginWithEmail,
};


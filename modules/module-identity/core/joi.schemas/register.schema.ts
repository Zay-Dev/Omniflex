import Joi from 'joi';
import j2s from 'joi-to-swagger';
import { modulesSchemas } from '@omniflex/core';

import * as Base from './_base';
import * as Types from '../types';

export const schemaRegister = Joi.object<Types.TBodyRegister>({
  ...Base.baseRegisterSchema,

  username: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .required(),

  email: Base.email.optional(),
}).unknown();

export const schemaRegisterWithEmail = Joi.object<Types.TBodyRegisterWithEmail>({
  ...Base.baseRegisterSchema,

  email: Base.email.required(),
}).unknown();

modulesSchemas.moduleIdentityRegister = {
  ...j2s(schemaRegister).swagger,
  example: {
    username: 'username',
    password: 'P@ssword12#',
    repeatPassword: 'P@ssword12#',

    email: 'license@omniflex.io',
    firstName: 'John',
    lastName: 'Doe',
  } as Types.TBodyRegister & { repeatPassword: string; },
};

modulesSchemas.moduleIdentityRegisterWithEmail = {
  ...j2s(schemaRegisterWithEmail).swagger,
  example: {
    email: 'license@omniflex.io',
    password: 'P@ssword12#',
    repeatPassword: 'P@ssword12#',

    firstName: 'John',
    lastName: 'Doe',
  } as Types.TBodyRegisterWithEmail & { repeatPassword: string; },
};

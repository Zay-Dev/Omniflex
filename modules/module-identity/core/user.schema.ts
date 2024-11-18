import Joi from 'joi';
import j2s from 'joi-to-swagger';
import { modulesSchemas } from '@omniflex/core';

export type TBodyRegister = {
  username: string;
  password: string;

  email?: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
};

export type TBodyRegisterWithEmail = Omit<TBodyRegister, "username"> & {
  email: string;
};

export type TBodyLogin = {
  username: string;
  password: string;
};

export type TBodyLoginWithEmail = {
  email: string;
  password: string;
};

const email = Joi.string().trim().email().lowercase();

const baseRegisterSchema = {
  password: Joi.string()
    .trim()
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .min(8)
    .required(),
  repeatPassword: Joi.ref('password'),

  firstName: Joi.string()
    .trim()
    .min(1)
    .max(50),

  lastName: Joi.string()
    .trim()
    .min(1)
    .max(50),

  mobileNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
};

const baseLoginSchema = {
  password: Joi.string().trim().required(),
};

const schemaRegister = Joi.object<TBodyRegister>({
  ...baseRegisterSchema,

  username: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .required(),

  email: email.optional(),
}).unknown();

const schemaRegisterWithEmail = Joi.object<TBodyRegisterWithEmail>({
  ...baseRegisterSchema,

  email: email.required(),
}).unknown();

const schemaLogin = Joi.object<TBodyLogin>({
  ...baseLoginSchema,

  username: Joi.string().trim().required(),
}).unknown();

const schemaLoginWithEmail = Joi.object<TBodyLoginWithEmail>({
  ...baseLoginSchema,

  email: email.required(),
}).unknown();

export const schemas = {
  register: schemaRegister,
  registerWithEmail: schemaRegisterWithEmail,

  login: schemaLogin,
  loginWithEmail: schemaLoginWithEmail,
};

modulesSchemas.moduleIdentity = {
  register: {
    ...j2s(schemaRegister).swagger,
    example: {
      username: 'username',
      password: 'P@ssword12#',
      repeatPassword: 'P@ssword12#',

      email: 'license@omniflex.io',
      firstName: 'John',
      lastName: 'Doe',
    } as TBodyRegister & { repeatPassword; },
  },

  registerWithEmail: {
    ...j2s(schemaRegisterWithEmail).swagger,
    example: {
      email: 'license@omniflex.io',
      password: 'P@ssword12#',
      repeatPassword: 'P@ssword12#',

      firstName: 'John',
      lastName: 'Doe',
    } as TBodyRegisterWithEmail & { repeatPassword; },
  },

  login: {
    ...j2s(schemaLogin).swagger,
    example: {
      username: 'username',
      password: 'P@ssword12#',
    } as TBodyLogin,
  },
  loginWithEmail: {
    ...j2s(schemaLoginWithEmail).swagger,
    example: {
      email: 'license@omniflex.io',
      password: 'P@ssword12#',
    } as TBodyLoginWithEmail,
  },
};
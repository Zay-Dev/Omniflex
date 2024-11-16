import Joi from 'joi';

export type TBodyRegister = {
  username: string;
  password: string;

  email?: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
};

export type TBodyRegisterWithEmail = TBodyRegister & {
  email: string;
};

const baseSchema = {
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

const email = Joi.string().trim().email().lowercase();

const schemaRegister = Joi.object<TBodyRegister>({
  ...baseSchema,

  username: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .required(),

  email: email.optional(),
}).unknown();

const schemaRegisterWithEmail = Joi.object<TBodyRegisterWithEmail>({
  ...baseSchema,

  email: email.required(),
}).unknown();

export const schemas = {
  register: schemaRegister,
  registerWithEmail: schemaRegisterWithEmail,
};
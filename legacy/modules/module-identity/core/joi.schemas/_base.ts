import Joi from 'joi';

export const email = Joi.string().trim().email().lowercase();

export const baseRegisterSchema = {
  password: Joi.string()
    .trim()
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .min(8)
    .required(),
  repeatPassword: Joi.string()
    .valid(Joi.ref('password'))
    .strip(),

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

export const baseLoginSchema = {
  password: Joi.string().trim().required(),
};
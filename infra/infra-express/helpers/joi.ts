import Joi from 'joi';
import { Request } from '../types';
import { errors } from '@omniflex/core';

const validate = (
  originalValues: any,
  schema: Joi.ObjectSchema,
) => {
  const { value, error } = schema.validate(originalValues, { abortEarly: false });

  if (error) {
    throw errors.badRequest(error.message);
  }

  return { value };
};

export const validateRequestBody = (
  req: Request,
  schema: Joi.ObjectSchema,
  { noReassign = false }: { noReassign?: boolean; } = {},
) => {
  const { value } = validate(req.body, schema);

  if (!noReassign) {
    req.body = value;
  }

  return { value };
};

export const validateRequestParams = (
  req: Request,
  schema: Joi.ObjectSchema,
) => {
  validate(req.params, schema);
};
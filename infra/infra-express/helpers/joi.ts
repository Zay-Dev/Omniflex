import Joi from 'joi';
import { errors } from '@omniflex/core';
import { Request, Response, NextFunction } from 'express';

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

export const tryValidateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, _: Response, next: NextFunction) => {
    try {
      validateRequestBody(req, schema);
    } catch (error) {
      return next(error);
    }

    return next();
  };
};

export const tryValidateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, _: Response, next: NextFunction) => {
    try {
      validateRequestParams(req, schema);
    } catch (error) {
      return next(error);
    }

    return next();
  };
};
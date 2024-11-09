import { Schema } from 'mongoose';

const toRequired = (type) => ({ ...type, required: true });

export const optionalInteger = {
  type: Number,
  get: Math.round,
  set: Math.round,
} as const;
export const requiredInteger = toRequired(optionalInteger);

export const optionalNumber = { type: Number } as const;
export const requiredNumber = toRequired(optionalNumber);

export const optionalString = { type: String } as const;
export const requiredString = toRequired(optionalString);
export const toDefaultString = (defaultValue) => ({
  ...optionalString,
  default: defaultValue,
});

export const toRequiredStringEnum = (values) => ({
  ...requiredString,
  enum: values,
});

export const optionalDate = { type: Date } as const;
export const requiredDate = toRequired(optionalDate);

export const optionalBoolean = { type: Boolean } as const;
export const requiredBoolean = toRequired(optionalBoolean);

export const defaultFalse = { ...optionalBoolean, default: false } as const;
export const defaultTrue = { ...optionalBoolean, default: true } as const;

export const toOptionalObjectId = (ref) => ({
  ref,
  type: Schema.Types.ObjectId,
});
export const toRequiredObjectId = (ref) => {
  return toRequired(toOptionalObjectId(ref));
};

export const toOptionalRefPathObjectId = (refPath) => ({
  refPath,
  type: Schema.Types.ObjectId,
});
export const toRequiredRefPathObjectId = (refPath) => {
  return toRequired(toOptionalRefPathObjectId(refPath));
};

export const mixed = {
  type: Schema.Types.Mixed,
  default: {},
} as const;
export const toOptionalMixedWithDefault = defaultValue => ({
  ...mixed,
  default: defaultValue,
});

export const toSubSchema = (schema) => new Schema(schema, { _id: false });

export const isDeleted = { ...defaultFalse } as const;

export const preferredDate = {
  readable: requiredString,
  utcOffsetMinutes: requiredInteger,

  year: { ...requiredInteger, min: 1 },
  month: { ...requiredInteger, min: 1 },
  dayOfMonth: { ...requiredInteger, min: 1 },
} as const;

export const preferredTime = {
  ...preferredDate,
  hour: { ...requiredInteger, min: 0 },
  minute: { ...requiredInteger, min: 0 },
  totalMinutes: { ...requiredInteger, min: 0 },
} as const;
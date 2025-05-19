import { Types, Model, Schema } from 'mongoose';

export type TModel<T> = Model<T>;
export type TSort<T> = Partial<Record<keyof T, 1 | -1>>;

export const isObjectId = (
  id: Parameters<typeof Types.ObjectId.isValid>[0],
) => {
  if (!id) return false;

  const validType = ['string', 'object'].includes(typeof id);

  if (!validType) return false;
  if (!Types.ObjectId.isValid(id)) return false;

  const castedId = new Types.ObjectId(id);

  return `${castedId}` === `${id}`;
};

const toRequired = <T extends Record<string, any>>(type: T) => ({
  ...type,
  required: true,
}) as T & { required: true; };

export const optionalInteger = () => ({
  type: Number,
  get: Math.round,
  set: Math.round,
});
export const requiredInteger = () => toRequired(optionalInteger());

export const optionalNumber = () => ({ type: Number });
export const requiredNumber = () => toRequired(optionalNumber());

export const optionalString = () => ({ type: String });
export const requiredString = () => toRequired(optionalString());
export const toDefaultString = (defaultValue: string) => ({
  ...optionalString(),
  default: defaultValue,
});

export const toRequiredStringEnum = (values: string[]) => ({
  ...requiredString(),
  enum: values,
});

export const toOptionalStringEnum = (values: string[]) => ({
  ...optionalString(),
  enum: values,
});

export const optionalDate = () => ({ type: Date });
export const requiredDate = () => toRequired(optionalDate());

export const optionalBoolean = () => ({ type: Boolean });
export const requiredBoolean = () => toRequired(optionalBoolean());

export const defaultFalse = () => ({ ...optionalBoolean(), default: false });
export const defaultTrue = () => ({ ...optionalBoolean(), default: true });

export const toOptionalObjectId = (ref: string) => ({
  ref,
  type: Schema.Types.ObjectId,
});
export const toRequiredObjectId = (ref: string) => {
  return toRequired(toOptionalObjectId(ref));
};

export const toOptionalRefPathObjectId = (refPath: string) => ({
  refPath,
  type: Schema.Types.ObjectId,
});
export const toRequiredRefPathObjectId = (refPath: string) => {
  return toRequired(toOptionalRefPathObjectId(refPath));
};

export const mixed = () => ({
  type: Schema.Types.Mixed,
  default: {},
});
export const toRequiredMixed = (defaultValue: Record<string, any> = {}) => ({
  ...mixed(),
  default: defaultValue,
});

export const subSchema = (
  schema: Record<string, any>,
  { _id }: { _id?: false; },
) => {
  return new Schema(schema, { _id });
};

export const deletedAt = () => ({ ...optionalDate(), default: null });

export const preferredDate = () => ({
  readable: requiredString(),
  utcOffsetMinutes: requiredInteger(),

  year: { ...requiredInteger(), min: 1 },
  month: { ...requiredInteger(), min: 1 },
  dayOfMonth: { ...requiredInteger(), min: 1 },
});

export const preferredTime = () => ({
  ...preferredDate(),
  hour: { ...requiredInteger(), min: 0 },
  minute: { ...requiredInteger(), min: 0 },
  totalMinutes: { ...requiredInteger(), min: 0 },
});
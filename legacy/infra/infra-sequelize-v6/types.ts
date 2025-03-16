import { DataTypes } from 'sequelize';

export const toOptional = (type) => ({ ...type, allowNull: true });
export const toRequired = (type) => ({ ...type, allowNull: false });

export const id = (type: 'UUID' | 'INTEGER', primaryKey = true) => {
  if (type == 'INTEGER') {
    return {
      type,
      primaryKey,
      autoIncrement: primaryKey,
    } as const;
  }

  return {
    primaryKey,
    type: DataTypes.UUID,
    defaultValue: primaryKey ? DataTypes.UUIDV4 : undefined,
  } as const;
};

export const toOptionalArray = (type) => ({
  allowNull: true,
  type: DataTypes.ARRAY(type),
});
export const toRequiredArray = (type) => ({
  ...toOptionalArray(type),
  allowNull: false,
});

export const optionalInteger = () => ({
  allowNull: true,
  type: DataTypes.INTEGER,
} as const);
export const requiredInteger = () => toRequired(optionalInteger());
export const minMaxInteger = (base, min?: number, max?: number) => {
  return {
    ...base,
    validate: { min, max },
  };
};

export const optionalNumber = () => ({
  allowNull: true,
  type: DataTypes.NUMBER,
} as const);
export const requiredNumber = () => toRequired(optionalNumber());

export const optionalString = () => ({
  allowNull: true,
  type: DataTypes.STRING,
} as const);
export const requiredString = () => toRequired(optionalString());
export const toDefaultString = (defaultValue) => ({
  ...optionalString(),
  defaultValue,
});

export const toEnum = (values) => ({
  type: DataTypes.ENUM(values),
});

export const optionalDate = () => ({
  allowNull: true,
  type: DataTypes.DATE,
} as const);
export const requiredDate = () => toRequired(optionalDate());

export const optionalBoolean = () => ({
  allowNull: true,
  type: DataTypes.BOOLEAN,
} as const);
export const requiredBoolean = () => toRequired(optionalBoolean());

export const defaultFalse = () => ({
  ...optionalBoolean(),
  defaultValue: false,
} as const);
export const defaultTrue = () => ({
  ...optionalBoolean(),
  defaultValue: true,
} as const);

export const mixed = () => ({
  defaultValue: {},
  type: DataTypes.JSON,
} as const);
export const toOptionalMixedWithDefault = (defaultValue) => ({
  ...mixed(),
  defaultValue,
});

export const deletedAt = () => ({
  ...optionalDate(),
  defaultValue: null,
} as const);

export const preferredDate = () => ({
  readable: requiredString(),
  utcOffsetMinutes: requiredInteger(),

  year: minMaxInteger(requiredInteger, 1),
  month: minMaxInteger(requiredInteger, 1, 12),
  dayOfMonth: minMaxInteger(requiredInteger, 1, 31),
} as const);

export const preferredTime = () => ({
  ...preferredDate(),
  hour: minMaxInteger(requiredInteger, 0, 23),
  minute: minMaxInteger(requiredInteger, 0, 59),
  totalMinutes: minMaxInteger(requiredInteger, 0),
} as const);
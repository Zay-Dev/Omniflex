import { DataTypes } from 'sequelize';
import { TBaseConfig } from '@omniflex/core/types';

export * from '@omniflex/infra-sequelize-v6/types';

export type TPostgresConfig = TBaseConfig & {
  postgres: {
    uri: string;
  },
};

export const mixedJSONB = () => ({
  defaultValue: {},
  type: DataTypes.JSONB,
} as const);
export const toOptionalMixedWithDefault = (defaultValue) => ({
  ...mixedJSONB(),
  defaultValue,
});
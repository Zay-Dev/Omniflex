import { TBaseConfig } from '@omniflex/core/types'

export * from '@omniflex/infra-sequelize-v6/types'

export type TSQLiteConfig = TBaseConfig & {
  sqlite: {
    storage: string
  }
}
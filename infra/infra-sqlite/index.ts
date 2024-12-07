import { Sequelize } from 'sequelize'
import { logger, Containers } from '@omniflex/core'

import { TSQLiteConfig } from './types'

export * from './repositories'
export * from '@omniflex/infra-sequelize-v6'

export const getConnection = async (
  { sqlite } = Containers.configAs<TSQLiteConfig>()
) => {
  const connection = new Sequelize({
    dialect: 'sqlite',
    storage: sqlite.storage,
    logging: (msg) => logger.debug(msg, {
      tags: ['sqlite'],
    }),
  })

  await connection.authenticate()
  return connection
} 
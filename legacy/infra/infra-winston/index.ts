import * as Transport from 'winston-transport';
import { WinstonLogger } from './winston-logger';

import { Containers } from '@omniflex/core';
import { ILogger, TBaseConfig } from '@omniflex/core/types';

import {
  format,
  transports,
  createLogger as createWinstonLogger,
} from 'winston';

export { transports } from 'winston';

const { combine, timestamp, printf, colorize } = format;

const createConsole = () => new transports.Console();

const myFormat = printf(({ level, message, timestamp }) => {
  return `- ${level} ${timestamp} || ${message}`;
});

export const createLogger = ({
  transports = [],
  noConsole = false,
  config = Containers.configAs<TBaseConfig>(),
}: {
  noConsole?: boolean;
  config?: TBaseConfig;
  transports?: Transport[];
} = {}): ILogger => {
  const logger = new WinstonLogger(
    createWinstonLogger({
      level: config.logging.level,

      format: combine(
        colorize(),
        timestamp(),
        myFormat
      ),

      transports: [
        ...transports,
        !noConsole ? createConsole() : null,
      ].filter(Boolean) as any,
    })
  );

  return logger;
};
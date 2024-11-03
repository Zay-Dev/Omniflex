import * as Transport from 'winston-transport';
import { WinstonLogger } from './winston-logger';
import { ILogger } from '@omniflex/core/types/logger';

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
}: {
  noConsole?: boolean;
  transports?: Transport[];
} = {}): ILogger => {
  const logger = new WinstonLogger(
    createWinstonLogger({
      level: 'silly',
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
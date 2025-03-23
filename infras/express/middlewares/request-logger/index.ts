import { PATHS } from './constants';
import * as Types from '../../types';
import { getMaskedRequest } from './request-masking-processor';

import morgan from 'morgan';
import { Request } from 'express';

const formatSection = (title: string, content: unknown): string => {
  if (!content || (typeof content === 'object' && !Object.keys(content as object).length)) {
    return '';
  }

  const line = '-'.repeat(30);
  return `\n${line} ${title} ${line}\n${typeof content === 'string' ? content : JSON.stringify(content, null, 2)}`;
};

const getLogLevel = (status: number, path: string): 'error' | 'warn' | 'info' => {
  if (PATHS.SUSPICIOUS_PATHS.some(p => path.toLowerCase().includes(p))) {
    return 'warn';
  }

  if (status >= 500) return 'error';
  if (status >= 400) return 'warn';
  return 'info';
};

morgan.token('request-id', (req: Types.TOmniRequest) => req._requestId);
morgan.token('server-type', (req: Types.TOmniRequest) => req._serverType);

morgan.token('processed-request',
  (req: Types.TOmniRequest, res: Types.TOmniResponse) => {
    const processed = getMaskedRequest(req);
    if (!processed) return '';

    const error = res._error;
    const sections: string[] = [];

    sections.push(formatSection('Request Details', {
      path: processed.path,
      method: processed.method,
      timestamp: new Date().toISOString(),

      requestId: req._requestId,
      serverType: req._serverType,
    }));

    if (processed.headers && Object.keys(processed.headers).length) {
      sections.push(formatSection('Headers', processed.headers));
    }

    if (processed.query && Object.keys(processed.query).length) {
      sections.push(formatSection('Query', processed.query));
    }

    if (processed.body &&
      Object.keys(processed.body).length &&
      !processed.headers['content-type']?.includes('multipart/form-data')) {
      sections.push(formatSection('Body', processed.body));
    }

    if (error) {
      sections.push(formatSection('Error', {
        name: error.name,
        message: error.message,
        errorCode: (error as any).errorCode,
        stack: error.stack,
      }));
    }

    return sections.join('\n');
  },
);

const createLogger = (format: string) => {
  return morgan(format, {
    stream: {
      write: (message: string) => {
        const matches = message.match(/Response: (\d+)/);
        const status = matches ? parseInt(matches[1], 10) : 500;
        const path = message.match(/path": "([^"]+)"/)?.[1] || '';

        const level = getLogLevel(status, path);
        logger[level](message.trim());
      },
    },
    skip: (_req: Request, res: any) => {
      const req = _req as Types.TOmniRequest;
      if (req._skipMorganLog) return true;

      return req.method === 'OPTIONS' ||
        PATHS.HEALTH_CHECK_PATHS
          .some(p => `${req.path}/`.includes(p));
    },
  });
};

export const getMorganLogger = (
  format: string = ':processed-request\nResponse: :status :response-time ms',
): any => createLogger(format);
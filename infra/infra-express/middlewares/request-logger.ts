import morgan from 'morgan';
import { logger } from '@omniflex/core';
import { Request, Response, NextFunction } from 'express';

import {
  processRequest,
  ProcessedRequest,
} from '@omniflex/infra-express/utils/request-processor';

const SUSPICIOUS_PATHS = [
  '/.env',
  '/wp-admin',
  '/admin',
  '/phpinfo',
  '/config',
  '/backup',
  '/.git',
  '/api/graphql',
];

const HEALTH_CHECK_PATHS = [
  '/health',
  '/ping',
  '/status',
];

const formatSection = (title: string, content: unknown): string => {
  if (!content || (typeof content === 'object' && !Object.keys(content as object).length)) {
    return '';
  }

  const line = '-'.repeat(30);
  return `\n${line} ${title} ${line}\n${typeof content === 'string' ? content : JSON.stringify(content, null, 2)}`;
};

const getLogLevel = (status: number, path: string): 'error' | 'warn' | 'info' => {
  if (SUSPICIOUS_PATHS.some(p => path.toLowerCase().includes(p))) {
    return 'warn';
  }

  if (status >= 500) return 'error';
  if (status >= 400) return 'warn';
  return 'info';
};

const captureRequest = (req: Request, res: Response, next: NextFunction) => {
  res.locals.__processedRequest = processRequest(req);

  return next();
};

morgan.token('request-id', (_, res: Response) => res.locals.requestId);
morgan.token('app-type', (_, res: Response) => res.locals.appType);
morgan.token('processed-request', (_, res: Response) => {
  const processed = res.locals.__processedRequest as ProcessedRequest;
  if (!processed) return '';

  const { error } = res.locals;
  const sections: string[] = [];

  sections.push(formatSection('Request Details', {
    path: processed.path,
    method: processed.method,
    timestamp: new Date().toISOString(),
    appType: res.locals.appType,
    requestId: res.locals.requestId,
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
});

const createLogger = () => {
  const format = ':processed-request\nResponse: :status :response-time ms';

  return morgan(format, {
    stream: {
      write: (message: string) => {
        const matches = message.match(/Response: (\d+)/);
        const status = matches ? parseInt(matches[1], 10) : 500;
        const path = message.match(/path": "([^"]+)"/)?.[1] || '';

        const level = getLogLevel(status, path);
        logger[level](message.trim());
      }
    },
    skip: (req: Request, res: any) => {
      if (res.locals._noLogger) return true;

      return HEALTH_CHECK_PATHS.some(p => req.path.includes(p)) ||
        req.method === 'OPTIONS';
    },
  });
};

export const requestLogger = () => [captureRequest, createLogger()];
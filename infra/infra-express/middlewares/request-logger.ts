import morgan from 'morgan';
import { logger } from '@omniflex/core';
import { Request, Response } from '../types';

// Constants for request classification
const SUSPICIOUS_PATHS = [
  '/.env',
  '/wp-admin',
  '/admin',
  '/phpinfo',
  '/config',
  '/backup',
  '/.git',
  '/api/graphql', // For introspection queries
];

const HEALTH_CHECK_PATHS = [
  '/health',
  '/ping',
  '/status'
];

// Utility functions
const formatSection = (title: string, content: unknown): string => {
  if (!content || (typeof content === 'object' && !Object.keys(content as object).length)) {
    return '';
  }

  const line = '-'.repeat(30);
  return `\n${line} ${title} ${line}\n${
    typeof content === 'string' ? content : JSON.stringify(content, null, 2)
  }`;
};

const getLogLevel = (status: number, path: string): 'error' | 'warn' | 'info' => {
  // Check for suspicious paths first
  if (SUSPICIOUS_PATHS.some(p => path.toLowerCase().includes(p))) {
    return 'warn';
  }

  // Then check status codes
  if (status >= 500) return 'error';
  if (status >= 400) return 'warn';
  return 'info';
};

// Morgan token setup
morgan.token('request-id', (_, res: Response) => res.locals.requestId);
morgan.token('app-type', (_, res: Response) => res.locals.appType);
morgan.token('processed-request', (_, res: Response) => {
  const { request, error } = res.locals;
  if (!request) return '';

  const sections: string[] = [];

  // Common section - always logged
  sections.push(formatSection('Request Details', {
    path: request.path,
    method: request.method,
    timestamp: new Date().toISOString(),
    appType: res.locals.appType,
    requestId: res.locals.requestId
  }));

  // Headers section - filtered and masked
  if (request.headers && Object.keys(request.headers).length) {
    sections.push(formatSection('Headers', request.headers));
  }

  // Query params
  if (request.query && Object.keys(request.query).length) {
    sections.push(formatSection('Query', request.query));
  }

  // Body - if present and not a file upload
  if (request.body &&
      Object.keys(request.body).length &&
      !request.headers['content-type']?.includes('multipart/form-data')) {
    sections.push(formatSection('Body', request.body));
  }

  // Add error details if present
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

export const requestLogger = () => {
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
    skip: (req: Request) => {
      // Skip health checks and OPTIONS requests
      return HEALTH_CHECK_PATHS.some(p => req.path.includes(p)) ||
             req.method === 'OPTIONS';
    }
  });
};
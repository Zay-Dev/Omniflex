import { Request } from 'express';

const SENSITIVE_KEYS = [
  // Authentication related
  'password',
  'token',
  'apiKey',
  'secret',
  'authorization',
  'auth',
  // Personal information
  'ssn',
  'socialSecurity',
  'dob',
  'birthDate',
  'creditCard',
  'cardNumber',
  'cvv',
  'pin',
  // Contact information that could be sensitive
  'email',
  'phone',
  'address',
  // Generic sensitive terms
  'private',
  'secure',
  'confidential',
];

const deepClone = <T>(obj: T): T => {
  if (obj === undefined) return obj;

  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    return obj;
  }
};

const maskValue = (value: string): string => {
  if (!value) return value;
  if (value.length <= 4) return '*'.repeat(value.length);

  const firstTwo = value.slice(0, 2);
  const lastTwo = value.slice(-2);
  const middleLength = value.length - 4;

  return `${firstTwo}${middleLength > 0 ? '*'.repeat(middleLength) : ''}${lastTwo}`;
};

const maskSensitiveValue = (values: any, forceSensitive = false): any => {
  if (!values) return values;

  if (typeof values === 'string' && forceSensitive) {
    return maskValue(values);
  }

  if (Array.isArray(values)) {
    return values.map(item => maskSensitiveValue(item, forceSensitive));
  }

  if (typeof values === 'object') {
    const processed = { ...values };

    for (const key of Object.keys(processed)) {
      const value = processed[key];

      if (!value) {
        processed[key] = value;
        continue;
      }

      const isKeySensitive = SENSITIVE_KEYS.some(
        sensitive => key.toLowerCase().includes(sensitive.toLowerCase())
      );

      if (typeof value === 'string') {
        processed[key] = isKeySensitive ? maskValue(value) : value;
      } else if (typeof value === 'object') {
        processed[key] = maskSensitiveValue(value, isKeySensitive);
      }
    }

    return processed;
  }

  return values;
};

export type ProcessedRequest = {
  body: any;
  query: any;
  params: any;
  headers: Record<string, string>;
  path: string;
  method: string;
  url: string;
};

export const processRequest = (req: Request): ProcessedRequest => ({
  body: maskSensitiveValue(deepClone(req.body)),
  query: maskSensitiveValue(deepClone(req.query)),
  params: maskSensitiveValue(deepClone(req.params)),
  headers: maskSensitiveValue(deepClone(req.headers)),
  path: req.path,
  method: req.method,
  url: req.url,
});
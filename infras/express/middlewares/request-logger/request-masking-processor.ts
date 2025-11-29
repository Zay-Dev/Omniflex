import { SENSITIVE_KEYS } from './constants';

import { Request } from 'express';

const deepClone = <T,>(obj: T): T => {
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

const maskSensitiveValue = (
  values: string | any[] | Record<string, any>,
  forceSensitive = false,
): any => {
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
        sensitive => key.toLowerCase().includes(sensitive.toLowerCase()),
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

class ProcessedRequest {
  public body: any;
  public query: any;
  public params: any;
  public headers: Record<string, string>;
  public path: string;
  public method: string;
  public url: string;
  public route: string;

  constructor(req: Request) {
    this.body = maskSensitiveValue(deepClone(req.body));
    this.query = maskSensitiveValue(deepClone(req.query));
    this.params = maskSensitiveValue(deepClone(req.params));
    this.headers = maskSensitiveValue(deepClone(req.headers));

    this.url = req.url;
    this.method = req.method;

    this.route = [
      req.baseUrl,
      req.route?.path || '',
    ].filter(Boolean).join('');

    this.path = req.path;
  }
}

export const getMaskedRequest = (req: Request): ProcessedRequest => {
  return new ProcessedRequest(req);
};
import { Request } from 'express';
import { processRequest } from '../../../utils/request-processor';

describe('Request Processor', () => {
  const createMockRequest = (overrides = {}): Request => ({
    body: {},
    query: {},
    params: {},
    headers: {},
    path: '/test',
    method: 'GET',
    url: '/test',
    ...overrides,
  } as Request);

  describe('processRequest', () => {
    test('should mask sensitive data in body', () => {
      const req = createMockRequest({
        body: {
          username: 'testuser',
          password: 'secret123',
          email: 'test@example.com',
        },
      });

      const processed = processRequest(req);

      expect(processed.body.username).toBe('testuser');
      expect(processed.body.password).toMatch(/^se\*{5}23$/);
      expect(processed.body.email).toMatch(/^te\*{12}om$/);
    });

    test('should mask sensitive data in query', () => {
      const req = createMockRequest({
        query: {
          token: 'abc123',
          apiKey: 'xyz789',
        },
      });

      const processed = processRequest(req);

      expect(processed.query.token).toMatch(/^ab\*{2}23$/);
      expect(processed.query.apiKey).toMatch(/^xy\*{2}89$/);
    });

    test('should mask sensitive data in headers', () => {
      const req = createMockRequest({
        headers: {
          authorization: 'Bearer token123',
          'content-type': 'application/json',
        },
      });

      const processed = processRequest(req);

      expect(processed.headers.authorization).toMatch(/^Be\*{11}23$/);
      expect(processed.headers['content-type']).toBe('application/json');
    });

    test('should handle nested objects', () => {
      const req = createMockRequest({
        body: {
          user: {
            name: 'test',
            credentials: {
              password: 'secret123',
              token: 'abc123',
            },
          },
        },
      });

      const processed = processRequest(req);

      expect(processed.body.user.name).toBe('test');
      expect(processed.body.user.credentials.password).toMatch(/^se\*{5}23$/);
      expect(processed.body.user.credentials.token).toMatch(/^ab\*{2}23$/);
    });

    test('should handle arrays', () => {
      const req = createMockRequest({
        body: {
          users: [
            { name: 'test1', email: 'test1@example.com' },
            { name: 'test2', email: 'test2@example.com' },
          ],
        },
      });

      const processed = processRequest(req);

      expect(processed.body.users[0].name).toBe('test1');
      expect(processed.body.users[0].email).toMatch(/^te\*{13}om$/);
      expect(processed.body.users[1].name).toBe('test2');
      expect(processed.body.users[1].email).toMatch(/^te\*{13}om$/);
    });

    test('should preserve request metadata', () => {
      const req = createMockRequest({
        path: '/api/test',
        method: 'POST',
        url: '/api/test?query=1',
      });

      const processed = processRequest(req);

      expect(processed.path).toBe('/api/test');
      expect(processed.method).toBe('POST');
      expect(processed.url).toBe('/api/test?query=1');
    });

    test('should handle null and undefined values', () => {
      const req = createMockRequest({
        body: {
          nullValue: null,
          undefinedValue: undefined,
          emptyString: '',
          password: 'secret',
        },
      });

      const processed = processRequest(req);

      expect(processed.body.nullValue).toBeNull();
      expect(processed.body.undefinedValue).toBeUndefined();
      expect(processed.body.emptyString).toBe('');
      expect(processed.body.password).toMatch(/^se\*{2}et$/);
    });
  });
});
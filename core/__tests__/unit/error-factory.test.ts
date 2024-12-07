import { errorFactory } from '../../impl/error-factory';

describe('ErrorFactory', () => {
  test('unauthorized creates error with code 401', () => {
    const error = errorFactory.unauthorized();
    expect(error.code).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });

  test('notFound creates error with custom message', () => {
    const error = errorFactory.notFound('Custom not found');
    expect(error.code).toBe(404);
    expect(error.message).toBe('Custom not found');
  });
});
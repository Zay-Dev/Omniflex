import { errorFactory } from '@omniflex/core/impl/error-factory';

describe('ErrorFactory', () => {
  it('[CORE-E0010] should create unauthorized error with code 401', () => {
    const error = errorFactory.unauthorized();
    expect(error.code).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });

  it('[CORE-E0020] should create notFound error with custom message', () => {
    const error = errorFactory.notFound('Custom not found');
    expect(error.code).toBe(404);
    expect(error.message).toBe('Custom not found');
  });
}); 
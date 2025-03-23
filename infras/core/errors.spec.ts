import '.';

describe('Core/Errors', () => {
  describe('ServerError', () => {
    it('[Core/Errors-0010] should create a ServerError with correct properties', () => {
      const error = new errors.ServerError({
        code: 500,
        message: 'Test error',
        error: 'TEST_ERROR',
        data: { test: true }
      });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(errors.ServerError);
      expect(error.code).toBe(500);
      expect(error.message).toBe('Test error');
      expect(error.error).toBe('TEST_ERROR');
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.data).toEqual({ test: true });
    });

    it('[Core/Errors-0020] should set errorCode from error if not provided', () => {
      const error = new errors.ServerError({
        code: 500,
        message: 'Test error',
        error: 'TEST_ERROR'
      });

      expect(error.errorCode).toBe('TEST_ERROR');
    });

    it('[Core/Errors-0030] should use provided errorCode over error', () => {
      const error = new errors.ServerError({
        code: 500,
        message: 'Test error',
        error: 'TEST_ERROR',
        errorCode: 'CUSTOM_CODE'
      });

      expect(error.errorCode).toBe('CUSTOM_CODE');
    });
  });

  describe('Error Factories', () => {
    it('[Core/Errors-0040] should create unauthorized error', () => {
      const error = errors.unauthorized();

      expect(error.code).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('[Core/Errors-0050] should create unauthorized error with custom options', () => {
      const error = errors.unauthorized({
        error: 'AUTH_FAILED',
        data: { reason: 'token expired' }
      });

      expect(error.code).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(error.error).toBe('AUTH_FAILED');
      expect(error.data).toEqual({ reason: 'token expired' });
    });

    it('[Core/Errors-0060] should create forbidden error', () => {
      const error = errors.forbidden();

      expect(error.code).toBe(403);
      expect(error.message).toBe('Forbidden');
    });

    it('[Core/Errors-0070] should create not found error with default message', () => {
      const error = errors.notFound();

      expect(error.code).toBe(404);
      expect(error.message).toBe('Not Found');
    });

    it('[Core/Errors-0080] should create not found error with custom message', () => {
      const error = errors.notFound('User not found');

      expect(error.code).toBe(404);
      expect(error.message).toBe('User not found');
    });

    it('[Core/Errors-0090] should create bad request error', () => {
      const error = errors.badRequest();

      expect(error.code).toBe(400);
      expect(error.message).toBe('Bad Request');
    });

    it('[Core/Errors-0100] should create conflict error', () => {
      const error = errors.conflict();

      expect(error.code).toBe(409);
      expect(error.message).toBe('Conflict');
    });

    it('[Core/Errors-0110] should create unprocessable entity error', () => {
      const error = errors.unprocessableEntity();

      expect(error.code).toBe(422);
      expect(error.message).toBe('Unprocessable Entity');
    });

    it('[Core/Errors-0120] should create custom error with default code', () => {
      const error = errors.custom('Custom error message');

      expect(error.code).toBe(500);
      expect(error.message).toBe('Custom error message');
    });

    it('[Core/Errors-0130] should create custom error with specified code', () => {
      const error = errors.custom('Custom error message', 418);

      expect(error.code).toBe(418);
      expect(error.message).toBe('Custom error message');
    });
  });

  describe('Global Access', () => {
    it('[Core/Errors-0140] should make errors available globally', () => {
      expect(globalThis.errors).toBeDefined();
      expect(globalThis.errors.ServerError).toBe(errors.ServerError);
      expect(typeof globalThis.errors.badRequest).toBe('function');
    });
  });
});
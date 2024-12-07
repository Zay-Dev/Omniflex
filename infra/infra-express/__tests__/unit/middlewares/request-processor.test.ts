import { requestProcessor } from "@omniflex/infra-express/middlewares/request-processor";

describe('RequestProcessor', () => {
  test('masks sensitive data in request body', () => {
    const req: any = {
      body: {
        username: 'test',
        password: 'secret123',
        email: 'test@example.com'
      }
    };

    const res: any = { locals: {} };
    const next = jest.fn();

    requestProcessor()(req, res, next);

    expect(res.locals.request.body.password).toMatch(/\*+/);
    expect(res.locals.request.body.email).not.toBe('test@example.com');
    expect(next).toHaveBeenCalled();
  });
});
jest.mock('@omniflex/core', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  },
  errors: {
    notFound: jest.fn(),
    badRequest: jest.fn(),
    unauthorized: jest.fn(),
    forbidden: jest.fn()
  },
  Containers: {
    configAs: jest.fn().mockReturnValue({
      logging: {
        exposeErrorDetails: false
      }
    })
  }
}));
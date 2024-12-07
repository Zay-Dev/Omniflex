export const createMockRequest = (options = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  ...options
});

export const createMockResponse = (options = {}) => {
  const res: any = {
    locals: {},
    ...options
  };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockNext = () => jest.fn();
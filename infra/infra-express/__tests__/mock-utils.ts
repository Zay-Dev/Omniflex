export const mockRequest = () => {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    path: '',
    method: '',
    url: ''
  };
};

export const mockResponse = () => {
  const res: any = {
    locals: {},
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
  return res;
};

export const mockNext = jest.fn();
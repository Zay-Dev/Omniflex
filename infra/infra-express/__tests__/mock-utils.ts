import { Request } from '../types';

export const mockRequest = (): Request => {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    path: '',
    method: '',
    url: ''
  } as unknown as Request;
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
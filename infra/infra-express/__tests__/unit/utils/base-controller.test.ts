import { BaseExpressController } from "@omniflex/infra-express/utils/base-controller";

describe('BaseExpressController', () => {
  let controller;

  const mockReq: any = { query: {}, params: {} };
  const mockRes: any = { locals: {}, json: jest.fn() };
  const mockNext = jest.fn();

  beforeEach(() => {
    controller = new BaseExpressController(mockReq, mockRes, mockNext);
  });

  test('respondOne formats single item response', () => {
    const testData = { id: 1 };
    controller.respondOne(testData);
    expect(mockRes.json).toHaveBeenCalledWith({ data: testData });
  });

  test('respondMany formats array response with total', () => {
    const testData = [{ id: 1 }, { id: 2 }];
    controller.respondMany(testData);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: testData,
      total: 2
    });
  });
});
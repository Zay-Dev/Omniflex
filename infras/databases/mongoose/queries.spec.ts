import '@omni-infra/core';
import { Types } from 'mongoose';

import { TModel } from './types';
import * as Queries from './queries';

describe('Mongoose/Queries', () => {
  // Mock model and data
  let mockModel: TModel<any>;
  let mockQuery: any;
  let mockLean: jest.Mock;
  let mockCountDocuments: jest.Mock;
  let mockClone: jest.Mock;
  let mockSkip: jest.Mock;
  let mockLimit: jest.Mock;
  let mockSort: jest.Mock;
  let mockFind: jest.Mock;
  let mockFindOne: jest.Mock;

  beforeEach(() => {
    mockLean = jest.fn().mockReturnValue([{ _id: 'test' }]);
    mockCountDocuments = jest.fn().mockReturnValue(1);
    mockClone = jest.fn().mockReturnThis();
    mockSkip = jest.fn().mockReturnThis();
    mockLimit = jest.fn().mockReturnThis();
    mockSort = jest.fn().mockReturnThis();

    mockQuery = {
      lean: mockLean,
      countDocuments: mockCountDocuments,
      clone: mockClone,
      skip: mockSkip,
      limit: mockLimit,
      sort: mockSort,
    };

    mockFind = jest.fn().mockReturnValue(mockQuery);
    mockFindOne = jest.fn().mockReturnValue(mockQuery);

    mockModel = {
      find: mockFind,
      findOne: mockFindOne,
      modelName: 'TestModel',
    } as unknown as TModel<any>;
  });

  describe('pipe', () => {
    it('[Mongoose/Queries-0010] should apply functions in sequence', () => {
      const mockQuery1 = { a: 1 };

      const fn1 = jest.fn().mockImplementation(q => mockQuery1);
      const fn2 = jest.fn().mockImplementation(q => q);

      Queries.pipe(mockQuery, fn1, fn2);

      expect(fn1).toHaveBeenCalledWith(mockQuery);
      expect(fn2).toHaveBeenCalledWith(mockQuery1);
    });
  });

  describe('getSortPipeFn', () => {
    it('[Mongoose/Queries-0020] should create sort function with ascending order', () => {
      const sortFn = Queries.getSortPipeFn({ sort: { name: 1 } });
      sortFn(mockQuery);

      expect(mockSort).toHaveBeenCalledWith('name');
    });

    it('[Mongoose/Queries-0030] should create sort function with descending order', () => {
      const sortFn = Queries.getSortPipeFn({ sort: { name: -1 } });
      sortFn(mockQuery);

      expect(mockSort).toHaveBeenCalledWith('-name');
    });

    it('[Mongoose/Queries-0040] should create sort function with multiple fields', () => {
      const sortFn = Queries.getSortPipeFn({ sort: { name: 1, age: -1 } });
      sortFn(mockQuery);

      expect(mockSort).toHaveBeenCalledWith('name -age');
    });

    it('[Mongoose/Queries-0050] should not apply sort if no sort options', () => {
      const sortFn = Queries.getSortPipeFn({});
      sortFn(mockQuery);

      expect(mockSort).not.toHaveBeenCalled();
    });
  });

  describe('getPaginatePipeFn', () => {
    it('[Mongoose/Queries-0060] should apply pagination', () => {
      const paginateFn = Queries.getPaginatePipeFn({ page: 2, pageSize: 10 });
      paginateFn(mockQuery);

      expect(mockSkip).toHaveBeenCalledWith(10);
      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('[Mongoose/Queries-0070] should not apply pagination if page is invalid', () => {
      const paginateFn = Queries.getPaginatePipeFn({ page: 0, pageSize: 10 });
      paginateFn(mockQuery);

      expect(mockSkip).not.toHaveBeenCalled();
      expect(mockLimit).not.toHaveBeenCalled();
    });

    it('[Mongoose/Queries-0080] should not apply pagination if pageSize is invalid', () => {
      const paginateFn = Queries.getPaginatePipeFn({ page: 2, pageSize: 0 });
      paginateFn(mockQuery);

      expect(mockSkip).not.toHaveBeenCalled();
      expect(mockLimit).not.toHaveBeenCalled();
    });

    it('[Mongoose/Queries-0090] should not apply pagination if page or pageSize is not provided', () => {
      const paginateFn = Queries.getPaginatePipeFn({});
      paginateFn(mockQuery);

      expect(mockSkip).not.toHaveBeenCalled();
      expect(mockLimit).not.toHaveBeenCalled();
    });
  });

  describe('queryBy', () => {
    it('[Mongoose/Queries-0100] should create query with default filters', () => {
      Queries.queryBy(mockModel);

      expect(mockFind).toHaveBeenCalledWith({
        deletedAt: null,
        isDeleted: { $ne: true },
      });
    });

    it('[Mongoose/Queries-0110] should create query with custom filters', () => {
      Queries.queryBy(mockModel, { name: 'test' });

      expect(mockFind).toHaveBeenCalledWith({
        deletedAt: null,
        isDeleted: { $ne: true },
        name: 'test',
      });
    });

    it('[Mongoose/Queries-0120] should apply sort and pagination', () => {
      Queries.queryBy(mockModel, {}, { sort: { name: 1 }, page: 2, pageSize: 10 });

      expect(mockSort).toHaveBeenCalledWith('name');
      expect(mockSkip).toHaveBeenCalledWith(10);
      expect(mockLimit).toHaveBeenCalledWith(10);
    });
  });

  describe('queryById', () => {
    it('[Mongoose/Queries-0130] should create query by id', () => {
      const id = new Types.ObjectId();
      Queries.queryById(mockModel, id);

      expect(mockFindOne).toHaveBeenCalledWith({
        _id: id,
        deletedAt: null,
        isDeleted: { $ne: true },
      });
    });

    it('[Mongoose/Queries-0140] should create query by id with extended query', () => {
      const id = new Types.ObjectId();
      Queries.queryById(mockModel, id, { name: 'test' });

      expect(mockFindOne).toHaveBeenCalledWith({
        _id: id,
        deletedAt: null,
        isDeleted: { $ne: true },
        name: 'test',
      });
    });

    it('[Mongoose/Queries-0150] should throw error if id is invalid', () => {
      expect(() => {
        Queries.queryById(mockModel, 'invalid-id' as any);
      }).toThrow();
    });
  });

  describe('atLeastOne', () => {
    it('[Mongoose/Queries-0160] should return results if at least one exists', async () => {
      const result = await Queries.atLeastOne(mockModel, { name: 'test' });

      expect(mockCountDocuments).toHaveBeenCalled();
      expect(mockLean).toHaveBeenCalled();
      expect(result).toEqual([{ _id: 'test' }]);
    });

    it('[Mongoose/Queries-0170] should throw not found error if no results', async () => {
      mockCountDocuments.mockReturnValue(0);

      await expect(Queries.atLeastOne(mockModel, { name: 'test' }))
        .rejects.toThrow('[TestModel] expecting at least one result, but got 0');
    });

    it('[Mongoose/Queries-0180] should use custom model name in error', async () => {
      mockCountDocuments.mockReturnValue(0);

      await expect(Queries.atLeastOne(mockModel, { name: 'test' }, { modelName: 'CustomModel' }))
        .rejects.toThrow('[CustomModel] expecting at least one result, but got 0');
    });
  });

  describe('hasCount', () => {
    it('[Mongoose/Queries-0190] should return results if count matches', async () => {
      const result = await Queries.hasCount(1, mockModel, { name: 'test' });

      expect(mockCountDocuments).toHaveBeenCalled();
      expect(mockLean).toHaveBeenCalled();
      expect(result).toEqual([{ _id: 'test' }]);
    });

    it('[Mongoose/Queries-0200] should throw not found error if count is zero', async () => {
      mockCountDocuments.mockReturnValue(1);

      await expect(Queries.hasCount(0, mockModel, { name: 'test' }))
        .rejects.toThrow('[TestModel] expecting length 0, but got 1');
    });

    it('[Mongoose/Queries-0210] should throw unprocessable entity error if count does not match', async () => {
      mockCountDocuments.mockReturnValue(2);

      await expect(Queries.hasCount(1, mockModel, { name: 'test' }))
        .rejects.toThrow('[TestModel] expecting length 1, but got 2');
    });

    it('[Mongoose/Queries-0220] should return empty array if expected count is zero and actual count is zero', async () => {
      mockCountDocuments.mockReturnValue(0);

      const result = await Queries.hasCount(0, mockModel, { name: 'test' });

      expect(result).toEqual([]);
      expect(mockLean).not.toHaveBeenCalled();
    });
  });

  describe('hasExactOne', () => {
    it('[Mongoose/Queries-0230] should return single result if exactly one exists', async () => {
      const result = await Queries.hasExactOne(mockModel, { name: 'test' });

      expect(mockCountDocuments).toHaveBeenCalled();
      expect(mockLean).toHaveBeenCalled();
      expect(result).toEqual({ _id: 'test' });
    });

    it('[Mongoose/Queries-0240] should throw error if count does not match', async () => {
      mockCountDocuments.mockReturnValue(2);

      await expect(Queries.hasExactOne(mockModel, { name: 'test' }))
        .rejects.toThrow('[TestModel] expecting length 1, but got 2');
    });
  });

  describe('requiredFirst', () => {
    it('[Mongoose/Queries-0250] should return first result if at least one exists', async () => {
      const result = await Queries.requiredFirst(mockModel, { name: 'test' });

      expect(mockCountDocuments).toHaveBeenCalled();
      expect(mockLean).toHaveBeenCalled();
      expect(result).toEqual({ _id: 'test' });
    });

    it('[Mongoose/Queries-0260] should throw error if no results', async () => {
      mockCountDocuments.mockReturnValue(0);

      await expect(Queries.requiredFirst(mockModel, { name: 'test' }))
        .rejects.toThrow('[TestModel] expecting at least one result, but got 0');
    });
  });
});
import { Request, Response, NextFunction } from 'express';
import { createMockRequest, createMockResponse, createMockNext, createMockRepository, errors } from '../jest.setup';
import * as middleware from './required-db-entries';
import { BaseError } from '@omniflex/core/types/error';

// Mock @omniflex/core
jest.mock('@omniflex/core', () => ({
  errors,
}));

describe('Required DB Entries Middleware', () => {
  let mockRepository;
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRepository = createMockRepository();
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext() as jest.Mock;
    mockResponse.locals = {
      required: {},
    };
  });

  describe('byPathId', () => {
    it('[MIDDLE-R0010] should validate entity by ID from path params', async () => {
      // Arrange
      const entity = { id: 1, name: 'Test' };
      mockRepository.isValidPrimaryKey.mockReturnValue(true);
      mockRepository.findOne.mockResolvedValue(entity);
      mockRequest.params.id = '1';

      // Act
      const handler = middleware.byPathId(mockRepository);
      await handler(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({ id: 1 });
      expect(mockResponse.locals.required._byId).toBe(entity);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('[MIDDLE-E0010] should handle invalid ID format', async () => {
      // Arrange
      mockRepository.isValidPrimaryKey.mockReturnValue(false);
      mockRequest.params.id = 'invalid';

      // Act
      const handler = middleware.byPathId(mockRepository);
      await handler(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(BaseError));
      expect(mockNext.mock.calls[0][0].message).toBe('Invalid ID');
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(BaseError);
    });

    it('[MIDDLE-E0020] should handle not found error', async () => {
      // Arrange
      mockRepository.isValidPrimaryKey.mockReturnValue(true);
      mockRepository.findOne.mockResolvedValue(null);
      mockRequest.params.id = '1';

      // Act
      const handler = middleware.byPathId(mockRepository);
      await handler(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(BaseError));
      expect(mockNext.mock.calls[0][0].message).toBe('Entity with id 1 not found');
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(BaseError);
    });
  });

  describe('byBodyId', () => {
    it('[MIDDLE-R0020] should validate entity by ID from request body', async () => {
      // Arrange
      const entity = { id: 1, name: 'Test' };
      mockRepository.isValidPrimaryKey.mockReturnValue(true);
      mockRepository.findOne.mockResolvedValue(entity);
      mockRequest.body.id = '1';

      // Act
      const handler = middleware.byBodyId(mockRepository);
      await handler(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({ id: 1 });
      expect(mockResponse.locals.required._byId).toBe(entity);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('[MIDDLE-E0030] should handle invalid ID in body', async () => {
      // Arrange
      mockRepository.isValidPrimaryKey.mockReturnValue(false);
      mockRequest.body.id = 'invalid';

      // Act
      const handler = middleware.byBodyId(mockRepository);
      await handler(mockRequest, mockResponse, mockNext);

      // Assert
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(BaseError);
      expect(error.message).toBe('Invalid ID');
    });
  });

  describe('firstMatch', () => {
    it('[MIDDLE-R0030] should validate entity by query', async () => {
      // Arrange
      const entity = { id: 1, name: 'Test' };
      const query = { name: 'Test' };
      mockRepository.findOne.mockResolvedValue(entity);

      // Act
      const handler = middleware.firstMatch(mockRepository, () => query);
      await handler(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith(query);
      expect(mockResponse.locals.required._firstMatch).toBe(entity);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('[MIDDLE-E0040] should handle not found error', async () => {
      // Arrange
      const query = { name: 'Test' };
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const handler = middleware.firstMatch(mockRepository, () => query);
      await handler(mockRequest, mockResponse, mockNext);

      // Assert
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(BaseError);
      expect(error.message).toBe('Not Found');
    });
  });

  describe('eitherExists', () => {
    it('[MIDDLE-R0040] should validate when one query matches', async () => {
      // Arrange
      const queries = [{ name: 'Test1' }, { name: 'Test2' }];
      mockRepository.exists.mockResolvedValueOnce(false);
      mockRepository.exists.mockResolvedValueOnce(true);

      // Act
      const handler = middleware.eitherExists(mockRepository, () => queries);
      await handler(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockRepository.exists).toHaveBeenCalledTimes(2);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('[MIDDLE-E0050] should handle no matches', async () => {
      // Arrange
      const queries = [{ name: 'Test1' }, { name: 'Test2' }];
      mockRepository.exists.mockResolvedValue(false);

      // Act
      const handler = middleware.eitherExists(mockRepository, () => queries);
      await handler(mockRequest, mockResponse, mockNext);

      // Assert
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(BaseError);
      expect(error.message).toBe('Not Found');
    });
  });

  describe('ensureNotExists', () => {
    it('[MIDDLE-R0050] should pass when entity does not exist', async () => {
      // Arrange
      const query = { name: 'Test' };
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const handler = middleware.ensureNotExists(mockRepository, () => query);
      await handler(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('[MIDDLE-E0060] should handle existing entity error', async () => {
      // Arrange
      const query = { name: 'Test' };
      const entity = { id: 1, name: 'Test' };
      mockRepository.findOne.mockResolvedValue(entity);

      // Act
      const handler = middleware.ensureNotExists(mockRepository, () => query);
      await handler(mockRequest, mockResponse, mockNext);

      // Assert
      const [error, returnedEntity] = mockNext.mock.calls[0];
      expect(error).toBeInstanceOf(BaseError);
      expect(error.message).toBe('Entity already exists');
      expect(returnedEntity).toBe(entity);
    });

    it('[MIDDLE-R0060] should use custom error message', async () => {
      // Arrange
      const query = { name: 'Test' };
      const entity = { id: 1, name: 'Test' };
      const message = 'Custom error message';
      mockRepository.findOne.mockResolvedValue(entity);

      // Act
      const handler = middleware.ensureNotExists(mockRepository, () => query, { existsMessage: message });
      await handler(mockRequest, mockResponse, mockNext);

      // Assert
      const [error, returnedEntity] = mockNext.mock.calls[0];
      expect(error).toBeInstanceOf(BaseError);
      expect(error.message).toBe(message);
      expect(returnedEntity).toBe(entity);
    });
  });
}); 
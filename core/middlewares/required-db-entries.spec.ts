import { requiredById, requiredFirstMatch, eitherExists, ensureNotExists } from './required-db-entries';
import { IBaseRepository, TQueryFilter, TQueryOptions } from '../types/repository';
import { BaseError } from '../types/error';

describe('Required DB Entries', () => {
  // Mock repository factory
  const createMockRepository = <T = any, TPrimaryKey = string>(): jest.Mocked<IBaseRepository<T, TPrimaryKey>> => ({
    // Methods we actually use in tests
    findOne: jest.fn(),
    exists: jest.fn(),

    // Required methods with no-op implementations
    isValidPrimaryKey: jest.fn().mockReturnValue(true),
    count: jest.fn().mockResolvedValue(0),
    findById: jest.fn().mockResolvedValue(null),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation(data => Promise.resolve(data as T)),
    updateById: jest.fn().mockResolvedValue(null),
    updateOne: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue(0),
    deleteById: jest.fn().mockResolvedValue(false),
    deleteOne: jest.fn().mockResolvedValue(false),
    delete: jest.fn().mockResolvedValue(0),
    softDeleteById: jest.fn().mockResolvedValue(false),
    softDeleteOne: jest.fn().mockResolvedValue(false),
    softDelete: jest.fn().mockResolvedValue(0),
    restoreById: jest.fn().mockResolvedValue(false),
    restoreOne: jest.fn().mockResolvedValue(false),
    restore: jest.fn().mockResolvedValue(0),
  });

  describe('requiredById', () => {
    it('[DB-V0010] should return entity when found', async () => {
      // Arrange
      const mockRepository = createMockRepository();
      const entity = { id: '123', name: 'test' };
      mockRepository.findOne.mockResolvedValue(entity);

      // Act
      const result = await requiredById('123', { repository: mockRepository });

      // Assert
      expect(result).toBe(entity);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ id: '123' });
    });

    it('[DB-V0020] should throw error when entity not found', async () => {
      // Arrange
      const mockRepository = createMockRepository();
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        requiredById('123', { repository: mockRepository })
      ).rejects.toThrow('Entity with id 123 not found');
    });

    it('[DB-V0030] should use custom error message', async () => {
      // Arrange
      const mockRepository = createMockRepository();
      mockRepository.findOne.mockResolvedValue(null);
      const notFoundMessage = 'Custom not found message';

      // Act & Assert
      await expect(
        requiredById('123', { repository: mockRepository, notFoundMessage })
      ).rejects.toThrow(notFoundMessage);
    });

    it('[DB-V0040] should call onError handler instead of throwing', async () => {
      // Arrange
      const mockRepository = createMockRepository();
      mockRepository.findOne.mockResolvedValue(null);
      const onError = jest.fn();

      // Act
      await requiredById('123', { repository: mockRepository, onError });

      // Assert
      expect(onError).toHaveBeenCalled();
      const error = onError.mock.calls[0][0];
      expect(error.message).toBe('Entity with id 123 not found');
    });

    it('[DB-V0050] should call retrieve callback with found entity', async () => {
      // Arrange
      const mockRepository = createMockRepository();
      const entity = { id: '123', name: 'test' };
      mockRepository.findOne.mockResolvedValue(entity);
      const retrieve = jest.fn();

      // Act
      await requiredById('123', { repository: mockRepository, retrieve });

      // Assert
      expect(retrieve).toHaveBeenCalledWith(entity);
    });
  });

  describe('requiredFirstMatch', () => {
    it('[DB-V0060] should return entity when found', async () => {
      // Arrange
      const mockRepository = createMockRepository();
      const entity = { id: '123', name: 'test' };
      mockRepository.findOne.mockResolvedValue(entity);
      const query = { name: 'test' };

      // Act
      const result = await requiredFirstMatch(query, { repository: mockRepository });

      // Assert
      expect(result).toBe(entity);
      expect(mockRepository.findOne).toHaveBeenCalledWith(query);
    });

    it('[DB-V0070] should throw error when entity not found', async () => {
      // Arrange
      const mockRepository = createMockRepository();
      mockRepository.findOne.mockResolvedValue(null);
      const query = { name: 'test' };
      const notFoundMessage = 'Custom not found message';

      // Act & Assert
      await expect(
        requiredFirstMatch(query, { repository: mockRepository, notFoundMessage })
      ).rejects.toThrow(notFoundMessage);
    });
  });

  describe('eitherExists', () => {
    it('[DB-V0080] should return when at least one query matches', async () => {
      // Arrange
      const mockRepository = createMockRepository();
      mockRepository.exists.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
      const queries = [{ name: 'test1' }, { name: 'test2' }];
      const retrieve = jest.fn();

      // Act
      await eitherExists(queries, { repository: mockRepository, retrieve });

      // Assert
      expect(mockRepository.exists).toHaveBeenCalledTimes(2);
      expect(retrieve).toHaveBeenCalledWith(null);
    });

    it('[DB-V0090] should throw error when no queries match', async () => {
      // Arrange
      const mockRepository = createMockRepository();
      mockRepository.exists.mockResolvedValue(false);
      const queries = [{ name: 'test1' }, { name: 'test2' }];
      const notFoundMessage = 'Custom not found message';

      // Act & Assert
      await expect(
        eitherExists(queries, { repository: mockRepository, notFoundMessage })
      ).rejects.toThrow(notFoundMessage);
    });

    it('[DB-V0100] should call onError handler when no queries match', async () => {
      // Arrange
      const mockRepository = createMockRepository();
      mockRepository.exists.mockResolvedValue(false);
      const queries = [{ name: 'test1' }];
      const onError = jest.fn();

      // Act
      await eitherExists(queries, { repository: mockRepository, onError });

      // Assert
      expect(onError).toHaveBeenCalled();
      const error = onError.mock.calls[0][0];
      expect(error).toBeInstanceOf(BaseError);
    });
  });

  describe('ensureNotExists', () => {
    it('[DB-V0110] should return when entity not found', async () => {
      // Arrange
      const mockRepository = createMockRepository();
      mockRepository.findOne.mockResolvedValue(null);
      const query = { name: 'test' };

      // Act & Assert
      await expect(
        ensureNotExists(query, { repository: mockRepository })
      ).resolves.toBeUndefined();
    });

    it('[DB-V0120] should throw error when entity exists', async () => {
      // Arrange
      const mockRepository = createMockRepository();
      const entity = { id: '123', name: 'test' };
      mockRepository.findOne.mockResolvedValue(entity);
      const query = { name: 'test' };
      const existsMessage = 'Custom exists message';

      // Act & Assert
      await expect(
        ensureNotExists(query, { repository: mockRepository, existsMessage })
      ).rejects.toThrow(existsMessage);
    });

    it('[DB-V0130] should call onError handler when entity exists', async () => {
      // Arrange
      const mockRepository = createMockRepository();
      const entity = { id: '123', name: 'test' };
      mockRepository.findOne.mockResolvedValue(entity);
      const query = { name: 'test' };
      const onError = jest.fn();

      // Act
      await ensureNotExists(query, { repository: mockRepository, onError });

      // Assert
      expect(onError).toHaveBeenCalled();
      const [error, foundEntity] = onError.mock.calls[0];
      expect(error).toBeInstanceOf(BaseError);
      expect(foundEntity).toBe(entity);
    });
  });
}); 
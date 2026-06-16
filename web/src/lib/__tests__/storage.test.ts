import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock cloudStorage
vi.mock('../cloudStorage', () => ({
  shouldUseCloud: vi.fn(() => false),
  cloudAnalysis: {
    save: vi.fn(),
    getAll: vi.fn(() => Promise.resolve([])),
    delete: vi.fn(),
    clearAll: vi.fn(),
  },
}));

// Import after mocking
import {
  getAllRecords,
  getRecordById,
  deleteRecord,
  clearAllRecords,
} from '../storage';

describe('Storage Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('getAllRecords', () => {
    it('should return empty array when no records exist', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const records = await getAllRecords();

      expect(records).toEqual([]);
    });

    it('should return parsed records', async () => {
      const mockRecords = [
        { id: '1', timestamp: Date.now(), imagePreview: '...', result: {} },
        { id: '2', timestamp: Date.now(), imagePreview: '...', result: {} },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockRecords));

      const records = await getAllRecords();

      expect(records).toHaveLength(2);
    });

    it('should return empty array for invalid JSON', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const records = await getAllRecords();

      expect(records).toHaveLength(0);
    });
  });

  describe('getRecordById', () => {
    it('should return record by id', async () => {
      const mockRecords = [
        { id: '1', timestamp: Date.now(), imagePreview: '...', result: { score: 85 } },
        { id: '2', timestamp: Date.now(), imagePreview: '...', result: { score: 90 } },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockRecords));

      const record = await getRecordById('2');

      expect(record).toHaveProperty('id', '2');
      expect(record).toHaveProperty('result.score', 90);
    });

    it('should return null for non-existent id', async () => {
      localStorageMock.getItem.mockReturnValue('[]');

      const record = await getRecordById('non-existent');

      expect(record).toBeNull();
    });
  });

  describe('deleteRecord', () => {
    it('should delete record by id', async () => {
      const mockRecords = [
        { id: '1', timestamp: Date.now(), imagePreview: '...', result: {} },
        { id: '2', timestamp: Date.now(), imagePreview: '...', result: {} },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockRecords));

      await deleteRecord('1');

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe('2');
    });
  });

  describe('clearAllRecords', () => {
    it('should clear all records', async () => {
      await clearAllRecords();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kb-coach-history');
    });
  });
});

import {
  isValidBase64Image,
  isValidEnum,
  isInRange,
  sanitizeString,
  isValidGoal,
  isValidExperience,
  isValidEquipment,
  isValidDaysPerWeek,
  isValidSessionDuration,
  isValidChatMessage,
  isValidChatHistory,
} from '../src/validation.js';

describe('Validation Utils', () => {
  describe('isValidBase64Image', () => {
    test('should return true for valid data URI image', () => {
      const validImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRof';
      expect(isValidBase64Image(validImage)).toBe(true);
    });

    test('should return true for valid PNG data URI', () => {
      const validImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      expect(isValidBase64Image(validImage)).toBe(true);
    });

    test('should return true for valid pure base64 string', () => {
      const validBase64 = 'A'.repeat(100);
      expect(isValidBase64Image(validBase64)).toBe(true);
    });

    test('should return false for short base64 string', () => {
      const shortBase64 = 'ABC';
      expect(isValidBase64Image(shortBase64)).toBe(false);
    });

    test('should return false for non-string input', () => {
      expect(isValidBase64Image(123)).toBe(false);
      expect(isValidBase64Image(null)).toBe(false);
      expect(isValidBase64Image(undefined)).toBe(false);
    });

    test('should return false for invalid data URI format', () => {
      expect(isValidBase64Image('data:image/bmp;base64,ABC')).toBe(false);
      expect(isValidBase64Image('data:text/plain;base64,ABC')).toBe(false);
    });
  });

  describe('isValidEnum', () => {
    test('should return true for valid enum value', () => {
      expect(isValidEnum('a', ['a', 'b', 'c'])).toBe(true);
    });

    test('should return false for invalid enum value', () => {
      expect(isValidEnum('d', ['a', 'b', 'c'])).toBe(false);
    });

    test('should handle empty array', () => {
      expect(isValidEnum('a', [])).toBe(false);
    });
  });

  describe('isInRange', () => {
    test('should return true for value within range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
    });

    test('should return true for value at min boundary', () => {
      expect(isInRange(1, 1, 10)).toBe(true);
    });

    test('should return true for value at max boundary', () => {
      expect(isInRange(10, 1, 10)).toBe(true);
    });

    test('should return false for value below range', () => {
      expect(isInRange(0, 1, 10)).toBe(false);
    });

    test('should return false for value above range', () => {
      expect(isInRange(11, 1, 10)).toBe(false);
    });

    test('should handle string numbers', () => {
      expect(isInRange('5', 1, 10)).toBe(true);
    });

    test('should return false for non-numeric values', () => {
      expect(isInRange('abc', 1, 10)).toBe(false);
      expect(isInRange(NaN, 1, 10)).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    test('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    test('should truncate to max length', () => {
      const longStr = 'a'.repeat(2000);
      expect(sanitizeString(longStr, 100)).toHaveLength(100);
    });

    test('should return empty string for non-string input', () => {
      expect(sanitizeString(123)).toBe('');
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
    });

    test('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('isValidGoal', () => {
    test('should return true for valid goals', () => {
      expect(isValidGoal('muscle_gain')).toBe(true);
      expect(isValidGoal('fat_loss')).toBe(true);
      expect(isValidGoal('posture_fix')).toBe(true);
      expect(isValidGoal('rehab')).toBe(true);
    });

    test('should return false for invalid goals', () => {
      expect(isValidGoal('weight_loss')).toBe(false);
      expect(isValidGoal('')).toBe(false);
      expect(isValidGoal(null)).toBe(false);
    });
  });

  describe('isValidExperience', () => {
    test('should return true for valid experience levels', () => {
      expect(isValidExperience('beginner')).toBe(true);
      expect(isValidExperience('intermediate')).toBe(true);
      expect(isValidExperience('advanced')).toBe(true);
    });

    test('should return false for invalid experience levels', () => {
      expect(isValidExperience('expert')).toBe(false);
      expect(isValidExperience('')).toBe(false);
    });
  });

  describe('isValidEquipment', () => {
    test('should return true for valid equipment types', () => {
      expect(isValidEquipment('gym')).toBe(true);
      expect(isValidEquipment('dumbbell')).toBe(true);
      expect(isValidEquipment('bodyweight')).toBe(true);
    });

    test('should return false for invalid equipment types', () => {
      expect(isValidEquipment('machine')).toBe(false);
      expect(isValidEquipment('')).toBe(false);
    });
  });

  describe('isValidDaysPerWeek', () => {
    test('should return true for valid days (1-7)', () => {
      expect(isValidDaysPerWeek(1)).toBe(true);
      expect(isValidDaysPerWeek(7)).toBe(true);
      expect(isValidDaysPerWeek(4)).toBe(true);
    });

    test('should return false for invalid days', () => {
      expect(isValidDaysPerWeek(0)).toBe(false);
      expect(isValidDaysPerWeek(8)).toBe(false);
      expect(isValidDaysPerWeek(-1)).toBe(false);
    });
  });

  describe('isValidSessionDuration', () => {
    test('should return true for valid duration (15-180)', () => {
      expect(isValidSessionDuration(15)).toBe(true);
      expect(isValidSessionDuration(180)).toBe(true);
      expect(isValidSessionDuration(60)).toBe(true);
    });

    test('should return false for invalid duration', () => {
      expect(isValidSessionDuration(14)).toBe(false);
      expect(isValidSessionDuration(181)).toBe(false);
    });
  });

  describe('isValidChatMessage', () => {
    test('should return true for valid message', () => {
      expect(isValidChatMessage('Hello')).toBe(true);
      expect(isValidChatMessage('a'.repeat(2000))).toBe(true);
    });

    test('should return false for empty message', () => {
      expect(isValidChatMessage('')).toBe(false);
    });

    test('should return false for message exceeding max length', () => {
      expect(isValidChatMessage('a'.repeat(2001))).toBe(false);
    });

    test('should return false for non-string input', () => {
      expect(isValidChatMessage(123)).toBe(false);
      expect(isValidChatMessage(null)).toBe(false);
    });
  });

  describe('isValidChatHistory', () => {
    test('should return true for valid history', () => {
      const history = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ];
      expect(isValidChatHistory(history)).toBe(true);
    });

    test('should return true for empty history', () => {
      expect(isValidChatHistory([])).toBe(true);
    });

    test('should return false for history exceeding max length', () => {
      const history = Array(21).fill({ role: 'user', content: 'Hello' });
      expect(isValidChatHistory(history)).toBe(false);
    });

    test('should return false for non-array input', () => {
      expect(isValidChatHistory('not an array')).toBe(false);
      expect(isValidChatHistory(null)).toBe(false);
    });

    test('should return false for invalid message format', () => {
      expect(isValidChatHistory([{ role: 'invalid', content: 'Hello' }])).toBe(false);
      expect(isValidChatHistory([{ role: 'user', content: '' }])).toBe(false);
    });
  });
});

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { MemoryCache } from '../src/cache.js';

describe('MemoryCache', () => {
  let cache;

  beforeEach(() => {
    jest.useFakeTimers();
    cache = new MemoryCache({ maxSize: 5, defaultTTL: 1000, checkInterval: 60000 });
  });

  afterEach(() => {
    cache.destroy();
    jest.useRealTimers();
  });

  describe('基础操作', () => {
    it('应该设置和获取值', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('应该返回 undefined 对于不存在的键', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('应该检查键是否存在', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('应该删除键值对', () => {
      cache.set('key1', 'value1');
      cache.delete('key1');
      expect(cache.get('key1')).toBeUndefined();
    });

    it('应该清空所有缓存', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.size).toBe(0);
    });

    it('应该返回正确的大小', () => {
      expect(cache.size).toBe(0);
      cache.set('key1', 'value1');
      expect(cache.size).toBe(1);
      cache.set('key2', 'value2');
      expect(cache.size).toBe(2);
    });

    it('应该存储各种类型的值', () => {
      cache.set('string', 'hello');
      cache.set('number', 42);
      cache.set('object', { key: 'value' });
      cache.set('array', [1, 2, 3]);
      cache.set('null', null);

      expect(cache.get('string')).toBe('hello');
      expect(cache.get('number')).toBe(42);
      expect(cache.get('object')).toEqual({ key: 'value' });
      expect(cache.get('array')).toEqual([1, 2, 3]);
      expect(cache.get('null')).toBeNull();
    });
  });

  describe('TTL 过期', () => {
    it('应该在 TTL 过期后返回 undefined', () => {
      cache.set('key1', 'value1', 100); // 100ms TTL

      // 99ms 后仍然有效
      jest.advanceTimersByTime(99);
      expect(cache.get('key1')).toBe('value1');

      // 101ms 后过期（需要 > 而不是 >=）
      jest.advanceTimersByTime(2);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('应该使用默认 TTL', () => {
      cache.set('key1', 'value1'); // 使用 defaultTTL: 1000

      jest.advanceTimersByTime(999);
      expect(cache.get('key1')).toBe('value1');

      jest.advanceTimersByTime(2);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('应该支持自定义 TTL', () => {
      cache.set('key1', 'value1', 500);
      cache.set('key2', 'value2', 1500);

      jest.advanceTimersByTime(501);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
    });

    it('has() 应该在过期后返回 false', () => {
      cache.set('key1', 'value1', 100);

      expect(cache.has('key1')).toBe(true);

      jest.advanceTimersByTime(101);
      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('LRU 淘汰', () => {
    it('应该在超过 maxSize 时淘汰最旧的项', () => {
      for (let i = 0; i < 5; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      // 添加第 6 个，应该淘汰 key0
      cache.set('key5', 'value5');

      expect(cache.get('key0')).toBeUndefined();
      expect(cache.get('key5')).toBe('value5');
    });
  });

  describe('cleanup', () => {
    it('应该清理过期的缓存项', () => {
      cache.set('key1', 'value1', 100);
      cache.set('key2', 'value2', 200);
      cache.set('key3', 'value3', 300);

      // 前进 150ms，key1 过期
      jest.advanceTimersByTime(150);

      // 手动清理
      cache.cleanup();

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    it('应该定期自动清理', () => {
      const shortCache = new MemoryCache({
        maxSize: 10,
        defaultTTL: 100,
        checkInterval: 50,
      });

      shortCache.set('key1', 'value1', 30);
      shortCache.set('key2', 'value2', 100);

      // 前进 60ms，key1 应该过期并被清理
      jest.advanceTimersByTime(60);

      expect(shortCache.get('key1')).toBeUndefined();
      expect(shortCache.get('key2')).toBe('value2');

      shortCache.destroy();
    });
  });

  describe('统计信息', () => {
    it('应该返回正确的统计信息', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const stats = cache.getStats();

      expect(stats).toHaveProperty('totalItems');
      expect(stats).toHaveProperty('expiredItems');
      expect(stats).toHaveProperty('activeItems');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('defaultTTL');
      expect(stats.totalItems).toBe(2);
      expect(stats.activeItems).toBe(2);
      expect(stats.expiredItems).toBe(0);
      expect(stats.maxSize).toBe(5);
      expect(stats.defaultTTL).toBe(1000);
    });

    it('应该正确计算过期项数量', () => {
      cache.set('key1', 'value1', 100);
      cache.set('key2', 'value2', 200);

      jest.advanceTimersByTime(150);

      const stats = cache.getStats();

      expect(stats.totalItems).toBe(2); // 还没清理
      expect(stats.expiredItems).toBe(1);
      expect(stats.activeItems).toBe(1);
    });
  });

  describe('destroy', () => {
    it('应该停止清理定时器并清空缓存', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.destroy();

      expect(cache.size).toBe(0);
    });
  });
});

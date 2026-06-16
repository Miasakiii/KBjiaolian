/**
 * 简单的内存缓存实现
 */

class MemoryCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.defaultTTL || 60 * 60 * 1000; // 1 hour
    this.checkInterval = options.checkInterval || 5 * 60 * 1000; // 5 minutes

    // 定期清理过期缓存
    this.cleanupTimer = setInterval(() => this.cleanup(), this.checkInterval);
  }

  /**
   * 设置缓存
   * @param {string} key 缓存键
   * @param {*} value 缓存值
   * @param {number} [ttl] 过期时间（毫秒）
   */
  set(key, value, ttl) {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const expirationTime = Date.now() + (ttl || this.defaultTTL);

    this.cache.set(key, {
      value,
      expirationTime,
      createdAt: Date.now(),
    });
  }

  /**
   * 获取缓存
   * @param {string} key 缓存键
   * @returns {*} 缓存值，如果不存在或已过期则返回 undefined
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return undefined;
    }

    // 检查是否过期
    if (Date.now() > item.expirationTime) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  /**
   * 检查缓存是否存在
   * @param {string} key 缓存键
   * @returns {boolean}
   */
  has(key) {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // 检查是否过期
    if (Date.now() > item.expirationTime) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 删除缓存
   * @param {string} key 缓存键
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   * @returns {number}
   */
  get size() {
    return this.cache.size;
  }

  /**
   * 清理过期缓存
   */
  cleanup() {
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expirationTime) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 销毁缓存实例，停止清理定时器
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   * @returns {Object}
   */
  getStats() {
    const now = Date.now();
    let expiredCount = 0;

    for (const [, item] of this.cache.entries()) {
      if (now > item.expirationTime) {
        expiredCount++;
      }
    }

    return {
      totalItems: this.cache.size,
      expiredItems: expiredCount,
      activeItems: this.cache.size - expiredCount,
      maxSize: this.maxSize,
      defaultTTL: this.defaultTTL,
    };
  }
}

// 创建默认缓存实例
const defaultCache = new MemoryCache({
  maxSize: 500,
  defaultTTL: 30 * 60 * 1000, // 30 minutes
});

export { MemoryCache };
export const cache = defaultCache;

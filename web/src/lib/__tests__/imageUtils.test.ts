import { describe, it, expect, vi } from 'vitest';
import {
  validateImageFile,
  formatFileSize,
  getBase64Size,
} from '../imageUtils';

describe('imageUtils', () => {
  describe('validateImageFile', () => {
    it('应该接受有效的图片文件', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('应该拒绝非图片文件', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该拒绝超过大小限制的文件', () => {
      // 创建一个 11MB 的文件
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const result = validateImageFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该接受所有支持的图片格式', () => {
      const formats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      formats.forEach((type) => {
        const file = new File(['test'], `test.${type.split('/')[1]}`, { type });
        const result = validateImageFile(file);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('formatFileSize', () => {
    it('应该格式化字节', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('应该处理小数', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
    });

    it('应该处理大文件', () => {
      expect(formatFileSize(5368709120)).toBe('5 GB');
    });
  });

  describe('getBase64Size', () => {
    it('应该计算 base64 字符串的大小', () => {
      // 简单的 base64 字符串
      const base64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
      const size = getBase64Size(base64);

      expect(size).toBeGreaterThan(0);
    });

    it('应该处理空字符串', () => {
      const size = getBase64Size('');
      expect(size).toBe(0);
    });
  });
});

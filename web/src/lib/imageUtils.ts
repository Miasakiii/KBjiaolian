/**
 * 图片压缩工具
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  mimeType: 'image/jpeg',
};

/**
 * 压缩图片
 * @param file 图片文件
 * @param options 压缩选项
 * @returns 压缩后的 base64 字符串
 */
export function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('无法创建 canvas 上下文'));
          return;
        }

        let { width, height } = img;

        // 计算缩放比例
        if (config.maxWidth && width > config.maxWidth) {
          height = (height * config.maxWidth) / width;
          width = config.maxWidth;
        }

        if (config.maxHeight && height > config.maxHeight) {
          width = (width * config.maxHeight) / height;
          height = config.maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);

        // 转换为 base64
        const compressedBase64 = canvas.toDataURL(
          config.mimeType || 'image/jpeg',
          config.quality || 0.8
        );

        resolve(compressedBase64);
      };

      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 从 base64 获取文件大小（字节）
 */
export function getBase64Size(base64: string): number {
  const base64WithoutPrefix = base64.split(',')[1] || base64;
  return Math.ceil((base64WithoutPrefix.length * 3) / 4);
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 验证图片文件
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '不支持的图片格式，请上传 JPG、PNG、GIF 或 WebP 格式的图片',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `图片大小超过限制，最大允许 ${formatFileSize(maxSize)}`,
    };
  }

  return { valid: true };
}

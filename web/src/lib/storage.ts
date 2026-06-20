import { AnalysisResult } from '@/types/analysis';
import { shouldUseCloud, cloudAnalysis } from './cloudStorage';

export interface HistoryRecord {
  id: string;
  timestamp: number;
  imagePreview: string;
  result: AnalysisResult;
}

const STORAGE_KEY = 'kb-coach-history';
const MAX_IMAGE_WIDTH = 200;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function compressImage(base64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('canvas 不可用'));
          return;
        }

        let width = img.width;
        let height = img.height;

        if (width > MAX_IMAGE_WIDTH) {
          height = (height * MAX_IMAGE_WIDTH) / width;
          width = MAX_IMAGE_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.6));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = base64;
  });
}

// 本地存储操作
const MAX_RECORDS = 100;

function saveToLocal(record: HistoryRecord): void {
  const records = getAllFromLocal();
  records.unshift(record);
  // 限制最大条数
  while (records.length > MAX_RECORDS) records.pop();

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // 持续丢弃最旧记录直到能存
      while (records.length > 1) {
        records.pop();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
          return;
        } catch {
          // 继续丢弃
        }
      }
      // 仍失败时抛错让调用方感知
      throw new Error('本地存储空间已满，请清理旧记录');
    }
    throw error;
  }
}

function getAllFromLocal(): HistoryRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function deleteFromLocal(id: string): void {
  const records = getAllFromLocal().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function clearLocal(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// 云端存储转换
function cloudToLocal(record: any): HistoryRecord {
  if (!record || typeof record !== 'object') {
    return {
      id: generateId(),
      timestamp: Date.now(),
      imagePreview: '',
      result: {
        score: 0,
        summary: '',
        issues: [],
        radar: {
          headForward: 0,
          roundShoulder: 0,
          pelvicTilt: 0,
          kneeExtension: 0,
          spineCurve: 0,
          shoulderHeight: 0,
          legAlignment: 0,
          coreStability: 0,
        },
        suggestions: [],
      },
    };
  }
  const result = record.result && typeof record.result === 'object' ? record.result : {};
  return {
    id: record.id ?? generateId(),
    timestamp: record.timestamp ?? Date.now(),
    imagePreview: typeof record.imagePreview === 'string' ? record.imagePreview : '',
    result: {
      score: typeof result.score === 'number' ? result.score : 0,
      summary: typeof result.summary === 'string' ? result.summary : '',
      issues: Array.isArray(result.issues) ? result.issues : [],
      radar: result.radar && typeof result.radar === 'object' ? result.radar : {},
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
    },
  };
}

// === 公开 API ===

export async function saveRecord(
  imagePreview: string,
  result: AnalysisResult
): Promise<HistoryRecord> {
  const compressedImage = await compressImage(imagePreview);

  const record: HistoryRecord = {
    id: generateId(),
    timestamp: Date.now(),
    imagePreview: compressedImage,
    result,
  };

  // 保存到本地
  saveToLocal(record);

  // 如果已登录，同步到云端
  if (shouldUseCloud()) {
    try {
      const cloudId = await cloudAnalysis.save(compressedImage, result);
      // 更新本地记录的 ID 为云端 ID
      const localRecords = getAllFromLocal();
      const idx = localRecords.findIndex(r => r.id === record.id);
      if (idx !== -1) {
        localRecords[idx].id = cloudId;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localRecords));
        record.id = cloudId;
      }
    } catch (err) {
      console.warn('同步分析记录到云端失败:', err);
    }
  }

  return record;
}

export async function getAllRecords(): Promise<HistoryRecord[]> {
  // 如果已登录，优先从云端获取
  if (shouldUseCloud()) {
    try {
      const cloudRecords = await cloudAnalysis.getAll();
      return cloudRecords.map(cloudToLocal);
    } catch (err) {
      console.warn('从云端获取分析记录失败，使用本地数据:', err);
    }
  }

  return getAllFromLocal();
}

export async function getRecordById(id: string): Promise<HistoryRecord | null> {
  const records = await getAllRecords();
  return records.find((r) => r.id === id) || null;
}

export async function deleteRecord(id: string): Promise<void> {
  // 删除本地记录
  deleteFromLocal(id);

  // 如果已登录，同步删除云端记录
  if (shouldUseCloud()) {
    try {
      await cloudAnalysis.delete(id);
    } catch (err) {
      console.warn('删除云端分析记录失败:', err);
    }
  }
}

export async function clearAllRecords(): Promise<void> {
  // 清空本地记录
  clearLocal();

  // 如果已登录，同步清空云端记录
  if (shouldUseCloud()) {
    try {
      await cloudAnalysis.clearAll();
    } catch (err) {
      console.warn('清空云端分析记录失败:', err);
    }
  }
}

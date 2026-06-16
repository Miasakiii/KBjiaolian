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
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

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
    };
    img.src = base64;
  });
}

// 本地存储操作
function saveToLocal(record: HistoryRecord): void {
  const records = getAllFromLocal();
  records.unshift(record);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      const trimmed = records.slice(0, -1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } else {
      throw error;
    }
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
  return {
    id: record.id,
    timestamp: record.timestamp,
    imagePreview: record.imagePreview || '',
    result: record.result,
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

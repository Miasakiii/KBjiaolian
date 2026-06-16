'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HistoryRecord } from '@/types/analysis';
import { getAllRecords, deleteRecord, clearAllRecords } from '@/lib/storage';
import HistoryCard from '@/components/HistoryCard';
import ResultPanel from '@/components/ResultPanel';

export default function HistoryPage() {
  const router = useRouter();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const loadRecords = async () => {
      const data = await getAllRecords();
      setRecords(data);
    };
    loadRecords();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteRecord(id);
    const data = await getAllRecords();
    setRecords(data);
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
  };

  const handleClearAll = async () => {
    await clearAllRecords();
    setRecords([]);
    setSelectedRecord(null);
    setShowConfirm(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <header className="text-center pt-12 pb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-2xl">📋</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">历史记录</h1>
        </div>
        <p className="text-primary-600 text-lg">查看和管理你的体态分析记录</p>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* 操作栏 */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← 返回分析
          </Link>
          <div className="flex items-center gap-3">
            {records.length >= 2 && (
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <span>📊</span>
                进度对比
              </Link>
            )}
            {records.length > 0 && (
              <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                清空所有记录
              </button>
            )}
          </div>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📭</span>
            </div>
            <h2 className="text-xl font-semibold text-primary-800 mb-2">暂无记录</h2>
            <p className="text-primary-500 mb-6">完成一次体态分析后，记录会自动保存到这里</p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              开始分析
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-5 gap-8">
            {/* 记录列表 */}
            <div className="md:col-span-2 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {records.map((record) => (
                <HistoryCard
                  key={record.id}
                  record={record}
                  onSelect={setSelectedRecord}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* 详情面板 */}
            <div className="md:col-span-3">
              {selectedRecord ? (
                <div className="sticky top-8">
                  <ResultPanel
                    result={selectedRecord.result}
                    isAnalyzing={false}
                    imagePreview={selectedRecord.imagePreview}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-white/50 rounded-2xl border border-dashed border-primary-200 p-8">
                  <div className="text-center">
                    <span className="text-4xl">👈</span>
                    <p className="text-primary-500 mt-4">点击左侧记录查看详情</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 确认弹窗 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">确认清空</h3>
            <p className="text-gray-600 mb-6">确定要清空所有历史记录吗？此操作无法撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

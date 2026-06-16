'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HistoryRecord } from '@/types/analysis';
import { getAllRecords } from '@/lib/storage';

export default function ComparePage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadRecords = async () => {
      const data = await getAllRecords();
      setRecords(data);
    };
    loadRecords();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const selectedRecords = records.filter((r) => selectedIds.includes(r.id));
  const record1 = selectedRecords[0];
  const record2 = selectedRecords[1];

  const getChange = (val1: number, val2: number) => {
    const diff = val2 - val1;
    if (diff > 0) return { text: `+${diff}`, color: 'text-red-600' };
    if (diff < 0) return { text: `${diff}`, color: 'text-green-600' };
    return { text: '0', color: 'text-gray-500' };
  };

  const radarLabels = [
    { key: 'headForward', label: '头前伸' },
    { key: 'roundShoulder', label: '圆肩' },
    { key: 'pelvicTilt', label: '骨盆前倾' },
    { key: 'kneeExtension', label: '膝超伸' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <header className="text-center pt-12 pb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-2xl">📊</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">进度对比</h1>
        </div>
        <p className="text-primary-600 text-lg">选择两条记录，查看体态变化</p>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* 操作栏 */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/history"
            className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← 返回历史
          </Link>
          <span className="text-sm text-primary-500">
            已选择 {selectedIds.length}/2 条记录
          </span>
        </div>

        {records.length < 2 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📸</span>
            </div>
            <h2 className="text-xl font-semibold text-primary-800 mb-2">记录不足</h2>
            <p className="text-primary-500 mb-6">需要至少两条分析记录才能进行对比</p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              去分析
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* 记录选择列表 */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <h3 className="font-semibold text-primary-800 mb-2">选择记录</h3>
              {records.map((record) => {
                const isSelected = selectedIds.includes(record.id);
                const date = new Date(record.timestamp);
                return (
                  <button
                    key={record.id}
                    onClick={() => toggleSelect(record.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-primary-200/50 bg-white/80 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-primary-500 bg-primary-500' : 'border-primary-300'
                      }`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-primary-700">
                            {date.toLocaleDateString('zh-CN')}
                          </span>
                          <span className={`text-sm font-bold ${
                            record.result.score >= 80 ? 'text-green-600' :
                            record.result.score >= 60 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {record.result.score}分
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 对比结果 */}
            <div className="md:col-span-2">
              {record1 && record2 ? (
                <div className="space-y-6">
                  {/* 评分对比 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
                    <h3 className="font-semibold text-primary-800 mb-4">体态评分对比</h3>
                    <div className="flex items-center justify-around">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${
                          record1.result.score >= 80 ? 'text-green-600' :
                          record1.result.score >= 60 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {record1.result.score}
                        </div>
                        <div className="text-sm text-primary-500 mt-1">
                          {new Date(record1.timestamp).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                      <div className="text-2xl text-primary-400">→</div>
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${
                          record2.result.score >= 80 ? 'text-green-600' :
                          record2.result.score >= 60 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {record2.result.score}
                        </div>
                        <div className="text-sm text-primary-500 mt-1">
                          {new Date(record2.timestamp).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${getChange(record1.result.score, record2.result.score).color}`}>
                        {getChange(record1.result.score, record2.result.score).text}
                      </div>
                    </div>
                  </div>

                  {/* 雷达图数据对比 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
                    <h3 className="font-semibold text-primary-800 mb-4">各维度对比</h3>
                    <div className="space-y-4">
                      {radarLabels.map(({ key, label }) => {
                        const val1 = record1.result.radar[key as keyof typeof record1.result.radar];
                        const val2 = record2.result.radar[key as keyof typeof record2.result.radar];
                        const change = getChange(val1, val2);
                        return (
                          <div key={key} className="flex items-center gap-4">
                            <span className="w-20 text-sm text-primary-700">{label}</span>
                            <div className="flex-1 flex items-center gap-2">
                              <div className="w-16 text-right text-sm font-medium text-primary-600">{val1}%</div>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-400 rounded-full" style={{ width: `${val1}%` }} />
                              </div>
                            </div>
                            <span className="text-primary-400">→</span>
                            <div className="flex-1 flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${val2}%` }} />
                              </div>
                              <div className="w-16 text-sm font-medium text-primary-600">{val2}%</div>
                            </div>
                            <span className={`w-12 text-right text-sm font-bold ${change.color}`}>
                              {change.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 问题变化 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
                    <h3 className="font-semibold text-primary-800 mb-4">体态问题变化</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm text-primary-500 mb-2">之前</h4>
                        <div className="flex flex-wrap gap-2">
                          {record1.result.issues.map((issue) => (
                            <span key={issue.name} className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-700">
                              {issue.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm text-primary-500 mb-2">之后</h4>
                        <div className="flex flex-wrap gap-2">
                          {record2.result.issues.map((issue) => (
                            <span key={issue.name} className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-700">
                              {issue.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-white/50 rounded-2xl border border-dashed border-primary-200 p-8">
                  <div className="text-center">
                    <span className="text-4xl">👈</span>
                    <p className="text-primary-500 mt-4">请选择两条记录进行对比</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

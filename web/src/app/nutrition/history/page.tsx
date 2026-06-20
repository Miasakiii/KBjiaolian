'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Utensils } from 'lucide-react';
import { NutritionRecord, mealTypeLabels, mealTypeIcons } from '@/types/nutrition';
import { DynamicIcon } from '@/lib/iconMap';
import { getAllNutritionRecords, deleteNutritionRecord, clearAllNutritionRecords } from '@/lib/nutritionStorage';

export default function NutritionHistoryPage() {
  const [records, setRecords] = useState<NutritionRecord[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const loadRecords = async () => {
      const data = await getAllNutritionRecords();
      setRecords(data);
    };
    loadRecords();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteNutritionRecord(id);
    const data = await getAllNutritionRecords();
    setRecords(data);
  };

  const handleClearAll = async () => {
    await clearAllNutritionRecords();
    setRecords([]);
    setShowConfirm(false);
  };

  // 按日期分组
  const groupedRecords = records.reduce((groups, record) => {
    const date = new Date(record.createdAt).toLocaleDateString('zh-CN');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {} as Record<string, NutritionRecord[]>);

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <header className="text-center pt-12 pb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-2xl">📋</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">饮食历史</h1>
        </div>
        <p className="text-primary-600 text-lg">查看你的饮食记录</p>
      </header>

      <div className="max-w-4xl mx-auto px-4 pb-12">
        {/* 操作栏 */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/nutrition"
            className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← 返回记录
          </Link>
          {records.length > 0 && (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              清空记录
            </button>
          )}
        </div>

        {records.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils size={48} className="text-primary-300 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-primary-800 mb-2">暂无饮食记录</h2>
            <p className="text-primary-500 mb-6">记录一次饮食后，会自动保存到这里</p>
            <Link
              href="/nutrition"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              记录饮食
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedRecords).map(([date, dayRecords]) => {
              const totalCalories = dayRecords.reduce(
                (sum, r) => sum + r.analysis.totalCalories,
                0
              );

              return (
                <div key={date}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-primary-800">{date}</h3>
                    <span className="text-sm text-primary-500">
                      共 {totalCalories} 千卡
                    </span>
                  </div>

                  <div className="space-y-3">
                    {dayRecords.map((record) => (
                      <div
                        key={record.id}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-4 hover:shadow-lg hover:border-primary-300 transition-all group"
                      >
                        <div className="flex gap-4">
                          {/* 缩略图 */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-primary-50">
                            <img
                              src={record.imagePreview}
                              alt="食物照片"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* 内容 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-lg mr-2">
                                  <DynamicIcon name={mealTypeIcons[record.mealType]} size={18} />
                                </span>
                                <span className="font-medium text-primary-800">
                                  {mealTypeLabels[record.mealType]}
                                </span>
                                <span className="text-sm text-primary-500 ml-2">
                                  {new Date(record.createdAt).toLocaleTimeString('zh-CN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-primary-700">
                                  {record.analysis.totalCalories} 千卡
                                </div>
                              </div>
                            </div>

                            {/* 食物列表 */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {record.analysis.foods.map((food, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full text-xs"
                                >
                                  {food.name}
                                </span>
                              ))}
                            </div>

                            {/* 删除按钮 */}
                            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="text-xs text-red-500 hover:text-red-700"
                              >
                                删除
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 确认弹窗 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-primary-700 mb-2">确认清空</h3>
            <p className="text-primary-500 mb-6">确定要清空所有饮食记录吗？此操作无法撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors"
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

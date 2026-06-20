'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { exportAsJSON, exportAsCSV, getDataStats } from '@/lib/exportData';

export default function ExportPage() {
  const [stats, setStats] = useState({
    analysisCount: 0,
    workoutCount: 0,
    nutritionCount: 0,
    planCount: 0,
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      const data = await getDataStats();
      setStats(data);
    };
    loadStats();
  }, []);

  const handleExportJSON = async () => {
    setExporting(true);
    try {
      await exportAsJSON();
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await exportAsCSV();
    } finally {
      setExporting(false);
    }
  };

  const totalRecords = stats.analysisCount + stats.workoutCount + stats.nutritionCount + stats.planCount;

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <header className="text-center pt-12 pb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-2xl"></span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">数据导出</h1>
        </div>
        <p className="text-primary-600 text-lg">导出你的所有数据</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← 返回首页
          </Link>
        </div>

        {/* 数据概览 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6 mb-6">
          <h3 className="font-semibold text-primary-800 mb-4">数据概览</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <div className="text-2xl font-bold text-primary-700">{stats.analysisCount}</div>
              <div className="text-sm text-primary-500">体态分析</div>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <div className="text-2xl font-bold text-primary-700">{stats.workoutCount}</div>
              <div className="text-sm text-primary-500">训练记录</div>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <div className="text-2xl font-bold text-primary-700">{stats.nutritionCount}</div>
              <div className="text-sm text-primary-500">饮食记录</div>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <div className="text-2xl font-bold text-primary-700">{stats.planCount}</div>
              <div className="text-sm text-primary-500">训练方案</div>
            </div>
          </div>
        </div>

        {/* 导出选项 */}
        <div className="space-y-4">
          {/* JSON 导出 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📄</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-primary-800 mb-1">JSON 格式</h3>
                <p className="text-sm text-primary-500 mb-4">
                  完整的结构化数据，适合备份或导入其他应用
                </p>
                <button
                  onClick={handleExportJSON}
                  disabled={exporting || totalRecords === 0}
                  className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-xl transition-colors"
                >
                  {exporting ? '导出中...' : '导出 JSON'}
                </button>
              </div>
            </div>
          </div>

          {/* CSV 导出 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl"></span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-primary-800 mb-1">CSV 格式</h3>
                <p className="text-sm text-primary-500 mb-4">
                  表格数据，适合用 Excel 或 Google Sheets 打开分析
                </p>
                <button
                  onClick={handleExportCSV}
                  disabled={exporting || totalRecords === 0}
                  className="px-6 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium rounded-xl transition-colors"
                >
                  {exporting ? '导出中...' : '导出 CSV'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 提示 */}
        {totalRecords === 0 && (
          <div className="mt-6 text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-yellow-700 text-sm">
              暂无数据可导出。完成体态分析、训练或饮食记录后，可以在这里导出数据。
            </p>
          </div>
        )}

        {/* 隐私说明 */}
        <div className="mt-6 bg-primary-50 rounded-2xl p-4">
          <h4 className="font-medium text-primary-800 mb-2">🔒 隐私说明</h4>
          <ul className="text-sm text-primary-600 space-y-1">
            <li>• 所有数据存储在你的浏览器本地</li>
            <li>• 导出的文件只保存在你的设备上</li>
            <li>• 我们不会收集或上传你的个人数据</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

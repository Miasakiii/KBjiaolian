'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import PhotoUpload from '@/components/PhotoUpload';
import ResultPanel from '@/components/ResultPanel';
import TipsCard from '@/components/TipsCard';
import { AnalysisResult } from '@/types/analysis';
import { saveRecord } from '@/lib/storage';
import { authFetch } from '@/lib/auth';

export default function AnalyzePage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);
    setSaved(false);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          setImagePreview(base64);

          const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
          const response = await authFetch(`${API_BASE}/analyze`, {
            method: 'POST',
            body: JSON.stringify({ image: base64 }),
          });

          if (!response.ok) {
            throw new Error('分析失败');
          }

          const data = await response.json();
          setResult(data);

          if (base64) {
            await saveRecord(base64, data);
            setSaved(true);
            localStorage.setItem('latestAnalysis', JSON.stringify(data));
          }
        } catch (error) {
          console.error('分析错误:', error);
          alert('分析失败，请确保后端服务已启动');
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('文件读取错误:', error);
      setIsAnalyzing(false);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <header className="text-center pt-12 pb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-2xl">💪</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">KB教练</h1>
        </div>
        <p className="text-primary-600 text-lg">AI 驱动的体态分析，开启你的健康之旅</p>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* 桌面：左右分栏 */}
        <div className="hidden md:grid md:grid-cols-5 gap-8" style={{ minHeight: '65vh' }}>
          <div className="col-span-2 space-y-6">
            <div className="h-96">
              <PhotoUpload onUpload={handleUpload} isAnalyzing={isAnalyzing} />
            </div>
            <TipsCard />
          </div>
          <div className="col-span-3">
            <ResultPanel result={result} isAnalyzing={isAnalyzing} imagePreview={imagePreview} />
          </div>
        </div>

        {/* 移动：上下布局 */}
        <div className="md:hidden space-y-6">
          <div className="h-72">
            <PhotoUpload onUpload={handleUpload} isAnalyzing={isAnalyzing} />
          </div>
          <TipsCard />
          <div className="min-h-96">
            <ResultPanel result={result} isAnalyzing={isAnalyzing} imagePreview={imagePreview} />
          </div>
        </div>

        {/* 保存状态提示 */}
        {saved && (
          <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm">
              ✓ 分析结果已保存
            </span>
          </div>
        )}

        {/* 操作入口 */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/history"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 hover:bg-white text-primary-700 font-medium rounded-xl border border-primary-200 transition-all hover:shadow-lg"
          >
            <span>📋</span>
            查看历史记录
          </Link>
          {result && (
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all hover:shadow-lg"
            >
              <span>🏋️</span>
              生成训练方案
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

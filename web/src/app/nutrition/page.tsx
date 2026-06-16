'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import PhotoUpload from '@/components/PhotoUpload';
import FoodResult from '@/components/FoodResult';
import { NutritionAnalysis, NutritionRecord, mealTypeLabels } from '@/types/nutrition';
import { saveNutritionRecord, getNutritionGoals } from '@/lib/nutritionStorage';
import { authFetch } from '@/lib/auth';

export default function NutritionPage() {
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mealType, setMealType] = useState<NutritionRecord['mealType']>('lunch');
  const [saved, setSaved] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setSaved(false);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          setImagePreview(base64);

          const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
          const response = await authFetch(`${API_BASE}/nutrition/analyze`, {
            method: 'POST',
            body: JSON.stringify({ image: base64 }),
          });

          if (!response.ok) {
            throw new Error('识别失败');
          }

          const data = await response.json();
          setAnalysis(data);
        } catch (error) {
          console.error('食物识别错误:', error);
          alert('食物识别失败，请确保后端服务已启动');
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

  const handleSave = useCallback(() => {
    if (!analysis || !imagePreview) return;

    const record: NutritionRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      imagePreview,
      analysis,
      mealType,
      notes: '',
      createdAt: Date.now(),
    };

    saveNutritionRecord(record);
    setSaved(true);
  }, [analysis, imagePreview, mealType]);

  const goals = getNutritionGoals();

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <header className="text-center pt-12 pb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-2xl">🍎</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">饮食记录</h1>
        </div>
        <p className="text-primary-600 text-lg">拍照识别食物，记录营养摄入</p>
      </header>

      <div className="max-w-4xl mx-auto px-4 pb-12">
        {/* 操作栏 */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← 返回分析
          </Link>
          <Link
            href="/nutrition/history"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <span>📋</span>
            饮食历史
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 左侧：上传区域 */}
          <div className="space-y-6">
            {/* 餐次选择 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-4">
              <label className="block text-sm font-medium text-primary-800 mb-3">选择餐次</label>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(mealTypeLabels) as NutritionRecord['mealType'][]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`p-2 rounded-xl text-sm font-medium transition-all ${
                      mealType === type
                        ? 'bg-primary-500 text-white'
                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    }`}
                  >
                    {mealTypeLabels[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* 上传区域 */}
            <div className="h-80">
              <PhotoUpload onUpload={handleUpload} isAnalyzing={isAnalyzing} />
            </div>

            {/* 提示 */}
            <div className="bg-primary-50 rounded-2xl p-4">
              <h3 className="font-medium text-primary-800 mb-2">📸 拍照提示</h3>
              <ul className="text-sm text-primary-600 space-y-1">
                <li>• 尽量拍到所有食物</li>
                <li>• 光线充足，避免阴影</li>
                <li>• 可以放一个参照物估算份量</li>
              </ul>
            </div>
          </div>

          {/* 右侧：识别结果 */}
          <div>
            {isAnalyzing ? (
              <div className="h-full flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-8">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-primary-700 font-medium">AI 正在识别食物...</p>
                  <p className="text-primary-500 text-sm mt-1">请稍候</p>
                </div>
              </div>
            ) : analysis ? (
              <FoodResult
                analysis={analysis}
                goals={goals}
                onSave={handleSave}
                saved={saved}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-white/50 rounded-2xl border border-dashed border-primary-200 p-8">
                <div className="text-center">
                  <span className="text-4xl">🍽️</span>
                  <p className="text-primary-500 mt-4">拍照或上传食物照片</p>
                  <p className="text-primary-400 text-sm mt-1">AI 将自动识别食物和营养成分</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

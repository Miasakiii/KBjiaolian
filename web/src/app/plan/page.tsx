'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PlanForm from '@/components/PlanForm';
import PlanResult from '@/components/PlanResult';
import TodayNutrition from '@/components/TodayNutrition';
import { PlanParams, TrainingPlan } from '@/types/plan';
import { AnalysisResult } from '@/types/analysis';
import { savePlan } from '@/lib/planStorage';
import { authFetch } from '@/lib/auth';

export default function PlanPage() {
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('latestAnalysis');
    if (stored) {
      try {
        setAnalysisResult(JSON.parse(stored));
      } catch {
        console.error('Failed to parse stored analysis');
      }
    }
  }, []);

  const handleGenerate = useCallback(async (params: PlanParams) => {
    if (!analysisResult) {
      alert('请先完成体态分析');
      return;
    }

    setIsGenerating(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await authFetch(`${API_BASE}/plan/generate`, {
        method: 'POST',
        body: JSON.stringify({
          ...params,
          analysisResult,
        }),
      });

      if (!response.ok) {
        throw new Error('生成失败');
      }

      const data = await response.json();
      setPlan(data);
      setSaved(false);
    } catch (error) {
      console.error('生成训练方案失败:', error);
      alert('生成训练方案失败，请确保后端服务已启动');
    } finally {
      setIsGenerating(false);
    }
  }, [analysisResult]);

  const handleSave = useCallback(() => {
    if (plan) {
      savePlan(plan);
      setSaved(true);
    }
  }, [plan]);

  const handleBack = useCallback(() => {
    setPlan(null);
    setSaved(false);
  }, []);

  if (!analysisResult) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <div className="max-w-2xl mx-auto px-4 pt-16">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📸</span>
            </div>
            <h2 className="text-xl font-semibold text-primary-800 mb-2">请先完成体态分析</h2>
            <p className="text-primary-500 mb-6">训练方案需要基于体态分析结果生成</p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              去分析
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <header className="text-center pt-12 pb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-2xl">🏋️</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
            {plan ? '训练方案' : '生成训练方案'}
          </h1>
        </div>
        <p className="text-primary-600 text-lg">
          {plan ? '查看你的个性化训练计划' : '根据体态分析结果定制专属方案'}
        </p>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← 返回分析
          </Link>
        </div>

        {plan ? (
          <div className="space-y-6">
            <PlanResult plan={plan} onSave={handleSave} onBack={handleBack} saved={saved} />
            <TodayNutrition />
          </div>
        ) : (
          <div className="space-y-6">
            <TodayNutrition />
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
              <h2 className="text-lg font-semibold text-primary-800 mb-4">设置训练偏好</h2>
              <PlanForm onSubmit={handleGenerate} isGenerating={isGenerating} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

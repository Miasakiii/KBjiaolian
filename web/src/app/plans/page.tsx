'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrainingPlan, goalLabels } from '@/types/plan';
import { getAllPlans, deletePlan } from '@/lib/planStorage';

export default function PlansPage() {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);

  useEffect(() => {
    const loadPlans = async () => {
      const data = await getAllPlans();
      setPlans(data);
    };
    loadPlans();
  }, []);

  const handleDelete = async (id: string) => {
    await deletePlan(id);
    const data = await getAllPlans();
    setPlans(data);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <header className="text-center pt-12 pb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-2xl">🏋️</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">训练方案</h1>
        </div>
        <p className="text-primary-600 text-lg">查看和管理你的训练计划</p>
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
            href="/plan"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <span>+</span>
            生成新方案
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h2 className="text-xl font-semibold text-primary-800 mb-2">暂无训练方案</h2>
            <p className="text-primary-500 mb-6">完成体态分析后，可以生成个性化训练方案</p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              生成训练方案
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6 hover:shadow-lg hover:border-primary-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-800">{plan.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs">
                        {goalLabels[plan.goal]}
                      </span>
                      <span className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs">
                        {plan.daysPerWeek} 天/周
                      </span>
                      <span className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs">
                        {plan.durationWeeks} 周
                      </span>
                    </div>
                    <p className="text-sm text-primary-500 mt-2">
                      创建于 {new Date(plan.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    删除
                  </button>
                </div>

                {/* 训练日概览 */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {plan.schedule.map((day) => (
                    <div
                      key={day.day}
                      className="flex-shrink-0 px-3 py-2 bg-primary-50 rounded-lg text-center"
                    >
                      <div className="text-xs font-medium text-primary-500">Day {day.day}</div>
                      <div className="text-xs text-primary-700 mt-1">{day.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

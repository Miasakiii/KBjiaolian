'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DailyNutrition, NutritionGoals } from '@/types/nutrition';
import { getTodayNutrition, getNutritionGoals } from '@/lib/nutritionStorage';

export default function TodayNutrition() {
  const [today, setToday] = useState<DailyNutrition | null>(null);
  const [goals, setGoals] = useState<NutritionGoals | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const todayData = await getTodayNutrition();
      setToday(todayData);
      const goalsData = await getNutritionGoals();
      setGoals(goalsData);
    };
    loadData();
  }, []);

  if (!today || !goals) {
    return null;
  }

  const getPercentage = (value: number, goal: number) => {
    return Math.min(100, Math.round((value / goal) * 100));
  };

  const getColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-orange-600';
    return 'text-green-600';
  };

  const macros = [
    { label: '蛋白质', value: today.totalProtein, goal: goals.protein, unit: 'g' },
    { label: '碳水', value: today.totalCarbs, goal: goals.carbs, unit: 'g' },
    { label: '脂肪', value: today.totalFat, goal: goals.fat, unit: 'g' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-primary-800 flex items-center gap-2">
          <span>🍎</span>
          今日营养
        </h3>
        <Link
          href="/nutrition"
          className="text-sm text-primary-500 hover:text-primary-700"
        >
          记录饮食 →
        </Link>
      </div>

      {/* 热量 */}
      <div className="text-center mb-4 p-4 bg-primary-50 rounded-xl">
        <div className="text-3xl font-bold text-primary-700">{today.totalCalories}</div>
        <div className="text-sm text-primary-500">
          / {goals.calories} 千卡 ·
          <span className={getColor(getPercentage(today.totalCalories, goals.calories))}>
            {' '}{getPercentage(today.totalCalories, goals.calories)}%
          </span>
        </div>
      </div>

      {/* 营养素 */}
      <div className="grid grid-cols-3 gap-3">
        {macros.map((macro) => {
          const percentage = getPercentage(macro.value, macro.goal);
          return (
            <div key={macro.label} className="text-center">
              <div className={`text-lg font-bold ${getColor(percentage)}`}>
                {macro.value}{macro.unit}
              </div>
              <div className="text-xs text-primary-500">{macro.label}</div>
              <div className="text-xs text-primary-400">{percentage}%</div>
            </div>
          );
        })}
      </div>

      {/* 餐次记录 */}
      {today.records.length > 0 && (
        <div className="mt-4 pt-4 border-t border-primary-100">
          <div className="text-sm text-primary-500">
            已记录 {today.records.length} 餐
          </div>
        </div>
      )}
    </div>
  );
}

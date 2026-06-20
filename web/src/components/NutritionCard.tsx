'use client';

import { Nutrition } from '@/types/plan';

interface NutritionCardProps {
  nutrition: Nutrition;
}

export default function NutritionCard({ nutrition }: NutritionCardProps) {
  const macros = [
    { label: '蛋白质', value: nutrition.protein, unit: 'g', color: 'bg-red-100 text-red-700' },
    { label: '碳水', value: nutrition.carbs, unit: 'g', color: 'bg-blue-100 text-blue-700' },
    { label: '脂肪', value: nutrition.fat, unit: 'g', color: 'bg-yellow-100 text-yellow-700' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
      <h3 className="font-semibold text-primary-800 mb-4 flex items-center gap-2">
        <span></span>
        营养建议
      </h3>

      {/* 热量 */}
      <div className="text-center mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl">
        <div className="text-3xl font-bold text-primary-700">{nutrition.calories}</div>
        <div className="text-sm text-primary-500">每日建议热量 (kcal)</div>
      </div>

      {/* 宏量营养素 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {macros.map((macro) => (
          <div key={macro.label} className="text-center">
            <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${macro.color}`}>
              {macro.value}{macro.unit}
            </div>
            <div className="text-xs text-primary-500 mt-1">{macro.label}</div>
          </div>
        ))}
      </div>

      {/* 营养提示 */}
      {nutrition.notes && (
        <p className="text-sm text-primary-600 bg-primary-50/50 p-3 rounded-lg">
          💡 {nutrition.notes}
        </p>
      )}
    </div>
  );
}

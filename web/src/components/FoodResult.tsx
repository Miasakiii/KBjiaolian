'use client';

import { NutritionAnalysis, NutritionGoals } from '@/types/nutrition';

interface FoodResultProps {
  analysis: NutritionAnalysis;
  goals?: NutritionGoals;
  onSave?: () => void;
  saved?: boolean;
}

export default function FoodResult({ analysis, goals, onSave, saved }: FoodResultProps) {
  const defaultGoals: NutritionGoals = goals || {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  };

  const getPercentage = (value: number, goal: number) => {
    return Math.min(100, Math.round((value / goal) * 100));
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const macros = [
    {
      label: '蛋白质',
      value: analysis.totalProtein,
      goal: defaultGoals.protein,
      unit: 'g',
      color: 'bg-blue-500',
    },
    {
      label: '碳水',
      value: analysis.totalCarbs,
      goal: defaultGoals.carbs,
      unit: 'g',
      color: 'bg-yellow-500',
    },
    {
      label: '脂肪',
      value: analysis.totalFat,
      goal: defaultGoals.fat,
      unit: 'g',
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 总热量 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6 text-center">
        <div className="text-sm text-primary-500 mb-2">总热量</div>
        <div className="text-4xl font-bold text-primary-800">{analysis.totalCalories}</div>
        <div className="text-sm text-primary-500">千卡</div>
        <div className="mt-2 text-xs text-primary-400">
          目标 {defaultGoals.calories} 千卡 ·
          已摄入 {getPercentage(analysis.totalCalories, defaultGoals.calories)}%
        </div>
      </div>

      {/* 营养素 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
        <h3 className="font-semibold text-primary-800 mb-4">营养成分</h3>
        <div className="space-y-4">
          {macros.map((macro) => {
            const percentage = getPercentage(macro.value, macro.goal);
            return (
              <div key={macro.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-primary-700">{macro.label}</span>
                  <span className="text-primary-500">
                    {macro.value}{macro.unit} / {macro.goal}{macro.unit}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(percentage)} rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 食物列表 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
        <h3 className="font-semibold text-primary-800 mb-4">识别结果</h3>
        <div className="space-y-3">
          {analysis.foods.map((food, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-primary-50/50 rounded-xl"
            >
              <div>
                <div className="font-medium text-primary-800">{food.name}</div>
                <div className="text-xs text-primary-500">{food.portion}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary-700">{food.calories} 千卡</div>
                <div className="text-xs text-primary-500">
                  P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 饮食建议 */}
      {analysis.tips && (
        <div className="bg-primary-50 rounded-2xl border border-primary-200/50 p-4">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <p className="text-sm text-primary-700">{analysis.tips}</p>
          </div>
        </div>
      )}

      {/* 保存按钮 */}
      {onSave && (
        <button
          onClick={onSave}
          disabled={saved}
          className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-xl transition-colors"
        >
          {saved ? '✓ 已保存' : '保存记录'}
        </button>
      )}
    </div>
  );
}

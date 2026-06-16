'use client';

import { useState } from 'react';
import { TrainingPlan, goalLabels, experienceLabels, equipmentLabels } from '@/types/plan';
import DaySchedule from './DaySchedule';
import NutritionCard from './NutritionCard';

interface PlanResultProps {
  plan: TrainingPlan;
  onSave: () => void;
  onBack: () => void;
  saved: boolean;
}

export default function PlanResult({ plan, onSave, onBack, saved }: PlanResultProps) {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <div className="space-y-6">
      {/* 方案头部 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-primary-800">{plan.name}</h2>
            <p className="text-sm text-primary-500 mt-1">
              {goalLabels[plan.goal]} · {experienceLabels[plan.experience]} · {equipmentLabels[plan.equipment]}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{plan.durationWeeks}</div>
            <div className="text-xs text-primary-500">周周期</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm">
            {plan.daysPerWeek} 天/周
          </span>
          <span className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm">
            {plan.sessionDuration} 分钟/次
          </span>
        </div>
      </div>

      {/* 训练日选择 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {plan.schedule.map((day, i) => (
            <button
              key={day.day}
              onClick={() => setActiveDay(i)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeDay === i
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              }`}
            >
              Day {day.day}
            </button>
          ))}
        </div>
      </div>

      {/* 当前训练日内容 */}
      <DaySchedule dayPlan={plan.schedule[activeDay]} />

      {/* 营养建议 */}
      <NutritionCard nutrition={plan.nutrition} />

      {/* 注意事项 */}
      {plan.notes && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
          <h3 className="font-semibold text-primary-800 mb-3 flex items-center gap-2">
            <span>⚠️</span>
            注意事项
          </h3>
          <p className="text-sm text-primary-700 leading-relaxed">{plan.notes}</p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 text-primary-600 bg-primary-50 hover:bg-primary-100 font-medium rounded-xl transition-colors"
        >
          返回修改
        </button>
        <button
          onClick={onSave}
          disabled={saved}
          className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-xl transition-colors"
        >
          {saved ? '✓ 已保存' : '保存方案'}
        </button>
      </div>
    </div>
  );
}

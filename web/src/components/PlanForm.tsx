'use client';

import { useState } from 'react';
import {
  PlanParams,
  TrainingGoal,
  ExperienceLevel,
  Equipment,
  goalLabels,
  experienceLabels,
  equipmentLabels,
} from '@/types/plan';

interface PlanFormProps {
  onSubmit: (params: PlanParams) => void;
  isGenerating: boolean;
}

export default function PlanForm({ onSubmit, isGenerating }: PlanFormProps) {
  const [params, setParams] = useState<PlanParams>({
    goal: 'posture_fix',
    experience: 'beginner',
    equipment: 'bodyweight',
    daysPerWeek: 4,
    sessionDuration: 60,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(params);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 训练目标 */}
      <div>
        <label className="block text-sm font-medium text-primary-800 mb-3">训练目标</label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(goalLabels) as TrainingGoal[]).map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => setParams({ ...params, goal })}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                params.goal === goal
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-primary-200/50 bg-white/80 text-primary-600 hover:border-primary-300'
              }`}
            >
              <span className="font-medium">{goalLabels[goal]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 经验水平 */}
      <div>
        <label className="block text-sm font-medium text-primary-800 mb-3">经验水平</label>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(experienceLabels) as ExperienceLevel[]).map((exp) => (
            <button
              key={exp}
              type="button"
              onClick={() => setParams({ ...params, experience: exp })}
              className={`p-3 rounded-xl border-2 transition-all text-center ${
                params.experience === exp
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-primary-200/50 bg-white/80 text-primary-600 hover:border-primary-300'
              }`}
            >
              <span className="font-medium">{experienceLabels[exp]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 训练设备 */}
      <div>
        <label className="block text-sm font-medium text-primary-800 mb-3">训练设备</label>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(equipmentLabels) as Equipment[]).map((equip) => (
            <button
              key={equip}
              type="button"
              onClick={() => setParams({ ...params, equipment: equip })}
              className={`p-3 rounded-xl border-2 transition-all text-center ${
                params.equipment === equip
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-primary-200/50 bg-white/80 text-primary-600 hover:border-primary-300'
              }`}
            >
              <span className="font-medium">{equipmentLabels[equip]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 每周天数 */}
      <div>
        <label className="block text-sm font-medium text-primary-800 mb-3">
          每周训练天数：{params.daysPerWeek} 天
        </label>
        <input
          type="range"
          min="3"
          max="6"
          value={params.daysPerWeek}
          onChange={(e) => setParams({ ...params, daysPerWeek: parseInt(e.target.value) })}
          className="w-full h-2 bg-primary-200 rounded-full appearance-none cursor-pointer accent-primary-500"
        />
        <div className="flex justify-between mt-2 text-xs text-primary-500">
          <span>3天</span>
          <span>4天</span>
          <span>5天</span>
          <span>6天</span>
        </div>
      </div>

      {/* 每次时长 */}
      <div>
        <label className="block text-sm font-medium text-primary-800 mb-3">
          每次训练时长：{params.sessionDuration} 分钟
        </label>
        <input
          type="range"
          min="30"
          max="90"
          step="15"
          value={params.sessionDuration}
          onChange={(e) => setParams({ ...params, sessionDuration: parseInt(e.target.value) })}
          className="w-full h-2 bg-primary-200 rounded-full appearance-none cursor-pointer accent-primary-500"
        />
        <div className="flex justify-between mt-2 text-xs text-primary-500">
          <span>30分</span>
          <span>45分</span>
          <span>60分</span>
          <span>75分</span>
          <span>90分</span>
        </div>
      </div>

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={isGenerating}
        className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <span>🎯</span>
            生成训练方案
          </>
        )}
      </button>
    </form>
  );
}

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ExerciseCard from '@/components/ExerciseCard';
import ExerciseDetailModal from '@/components/ExerciseDetailModal';
import {
  ExerciseDef,
  MuscleGroup,
  Difficulty,
  Equipment,
  muscleGroupLabels,
  muscleGroupEmojis,
  difficultyLabels,
  equipmentLabels,
  filterExercises,
  searchExercises,
  getExercisesByMuscleGroup,
} from '@/data/exercises';

export default function ExercisesPage() {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | ''>('');
  const [viewMode, setViewMode] = useState<'grid' | 'group'>('group');
  const [detailExercise, setDetailExercise] = useState<ExerciseDef | null>(null);

  // 筛选结果
  const filtered = useMemo(() => {
    if (search.trim()) {
      return searchExercises(search);
    }
    return filterExercises(
      selectedMuscle || undefined,
      selectedDifficulty || undefined,
      selectedEquipment || undefined
    );
  }, [search, selectedMuscle, selectedDifficulty, selectedEquipment]);

  // 分组视图数据
  const grouped = useMemo(() => {
    const map = new Map<MuscleGroup, ExerciseDef[]>();
    for (const ex of filtered) {
      const list = map.get(ex.muscleGroup) || [];
      list.push(ex);
      map.set(ex.muscleGroup, list);
    }
    return map;
  }, [filtered]);

  const hasFilters = search || selectedMuscle || selectedDifficulty || selectedEquipment;

  const clearFilters = () => {
    setSearch('');
    setSelectedMuscle('');
    setSelectedDifficulty('');
    setSelectedEquipment('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* 头部 */}
      <header className="text-center pt-12 pb-6">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-2xl">📚</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
            训练动作库
          </h1>
        </div>
        <p className="text-primary-600 text-lg">{filtered.length} 个动作</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium mb-4"
        >
          ← 返回首页
        </Link>

        {/* 搜索栏 */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="搜索动作名称..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {/* 筛选器 */}
        <div className="space-y-3 mb-4">
          {/* 肌群筛选 */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedMuscle('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !selectedMuscle
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/80 text-gray-600 hover:bg-primary-100'
              }`}
              type="button"
            >
              全部
            </button>
            {(Object.keys(muscleGroupLabels) as MuscleGroup[]).map((mg) => (
              <button
                key={mg}
                onClick={() => setSelectedMuscle(selectedMuscle === mg ? '' : mg)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedMuscle === mg
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/80 text-gray-600 hover:bg-primary-100'
                }`}
                type="button"
              >
                {muscleGroupEmojis[mg]} {muscleGroupLabels[mg]}
              </button>
            ))}
          </div>

          {/* 难度 + 器械筛选 */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | '')}
              className="px-3 py-1.5 bg-white/80 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">全部难度</option>
              {(Object.keys(difficultyLabels) as Difficulty[]).map((d) => (
                <option key={d} value={d}>
                  {difficultyLabels[d]}
                </option>
              ))}
            </select>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value as Equipment | '')}
              className="px-3 py-1.5 bg-white/80 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">全部器械</option>
              {(Object.keys(equipmentLabels) as Equipment[]).map((eq) => (
                <option key={eq} value={eq}>
                  {equipmentLabels[eq]}
                </option>
              ))}
            </select>

            {/* 视图切换 */}
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => setViewMode('group')}
                className={`px-2.5 py-1.5 rounded-lg text-sm ${
                  viewMode === 'group'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/80 text-gray-600'
                }`}
                type="button"
              >
                分组
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1.5 rounded-lg text-sm ${
                  viewMode === 'grid'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/80 text-gray-600'
                }`}
                type="button"
              >
                列表
              </button>
            </div>
          </div>
        </div>

        {/* 清除筛选 */}
        {hasFilters && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">找到 {filtered.length} 个动作</p>
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700"
              type="button"
            >
              清除筛选
            </button>
          </div>
        )}

        {/* 动作列表 */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">未找到匹配的动作</h3>
            <p className="text-gray-500 mb-4">试试其他搜索词或筛选条件</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm"
              type="button"
            >
              清除筛选
            </button>
          </div>
        ) : viewMode === 'group' ? (
          // 分组视图
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([mg, exs]) => (
              <div key={mg}>
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>{muscleGroupEmojis[mg]}</span>
                  <span>{muscleGroupLabels[mg]}</span>
                  <span className="text-sm font-normal text-gray-500">({exs.length})</span>
                </h2>
                <div className="space-y-3">
                  {exs.map((ex) => (
                    <ExerciseCard
                      key={ex.id}
                      exercise={ex}
                      onClick={setDetailExercise}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 列表视图
          <div className="space-y-3">
            {filtered.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                onClick={setDetailExercise}
              />
            ))}
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {detailExercise && (
        <ExerciseDetailModal
          exercise={detailExercise}
          onClose={() => setDetailExercise(null)}
        />
      )}
    </main>
  );
}

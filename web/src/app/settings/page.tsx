'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { UserProfile, UserGoals, goalLabels, experienceLabels, genderLabels } from '@/types/user';
import { getUserProfile, saveUserProfile, getUserGoals, saveUserGoals, calculateBMI, calculateBMR } from '@/lib/userStorage';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [goals, setGoals] = useState<UserGoals>(getUserGoals());
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'goals'>('profile');

  const bmi = calculateBMI(profile.weight, profile.height);
  const bmr = calculateBMR(profile);

  const handleSaveProfile = () => {
    saveUserProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveGoals = () => {
    saveUserGoals(goals);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: '偏瘦', color: 'text-blue-600' };
    if (bmi < 24) return { label: '正常', color: 'text-green-600' };
    if (bmi < 28) return { label: '偏胖', color: 'text-orange-600' };
    return { label: '肥胖', color: 'text-red-600' };
  };

  const bmiCategory = getBMICategory(bmi);

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <header className="text-center pt-12 pb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Settings size={24} className="text-primary-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">个人设置</h1>
        </div>
        <p className="text-primary-600 text-lg">管理你的个人信息和目标</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← 返回首页
          </Link>
        </div>

        {/* 标签页切换 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-primary-500 text-white'
                : 'bg-white/80 text-primary-600 hover:bg-white'
            }`}
          >
            个人信息
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${
              activeTab === 'goals'
                ? 'bg-primary-500 text-white'
                : 'bg-white/80 text-primary-600 hover:bg-white'
            }`}
          >
            训练目标
          </button>
        </div>

        {/* 个人信息 */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
              <h3 className="font-semibold text-primary-800 mb-4">基本信息</h3>

              <div className="space-y-4">
                {/* 昵称 */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">昵称</label>
                  <input
                    type="text"
                    value={profile.nickname}
                    onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                    placeholder="输入你的昵称"
                    className="w-full px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none"
                  />
                </div>

                {/* 性别 */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">性别</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(genderLabels) as Array<keyof typeof genderLabels>).map((gender) => (
                      <button
                        key={gender}
                        onClick={() => setProfile({ ...profile, gender: gender as 'male' | 'female' | 'other' })}
                        className={`py-2.5 rounded-xl font-medium transition-colors ${
                          profile.gender === gender
                            ? 'bg-primary-500 text-white'
                            : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                        }`}
                      >
                        {genderLabels[gender]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 年龄 */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">年龄</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                    min="10"
                    max="100"
                    className="w-full px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none"
                  />
                </div>

                {/* 身高体重 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">身高 (cm)</label>
                    <input
                      type="number"
                      value={profile.height}
                      onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) || 0 })}
                      min="100"
                      max="250"
                      className="w-full px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">体重 (kg)</label>
                    <input
                      type="number"
                      value={profile.weight}
                      onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) || 0 })}
                      min="30"
                      max="200"
                      className="w-full px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 身体数据 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
              <h3 className="font-semibold text-primary-800 mb-4">身体数据</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-xl">
                  <div className="text-2xl font-bold text-primary-700">{bmi}</div>
                  <div className="text-sm text-primary-500">BMI</div>
                  <div className={`text-xs font-medium mt-1 ${bmiCategory.color}`}>
                    {bmiCategory.label}
                  </div>
                </div>
                <div className="text-center p-4 bg-primary-50 rounded-xl">
                  <div className="text-2xl font-bold text-primary-700">{bmr}</div>
                  <div className="text-sm text-primary-500">基础代谢</div>
                  <div className="text-xs text-primary-400 mt-1">kcal/天</div>
                </div>
              </div>
            </div>

            {/* 训练偏好 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
              <h3 className="font-semibold text-primary-800 mb-4">训练偏好</h3>

              <div className="space-y-4">
                {/* 训练目标 */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">训练目标</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(goalLabels) as Array<keyof typeof goalLabels>).map((goal) => (
                      <button
                        key={goal}
                        onClick={() => setProfile({ ...profile, goal: goal as 'muscle_gain' | 'fat_loss' | 'posture_fix' | 'health' })}
                        className={`py-2.5 rounded-xl font-medium transition-colors ${
                          profile.goal === goal
                            ? 'bg-primary-500 text-white'
                            : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                        }`}
                      >
                        {goalLabels[goal]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 经验水平 */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">经验水平</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(experienceLabels) as Array<keyof typeof experienceLabels>).map((exp) => (
                      <button
                        key={exp}
                        onClick={() => setProfile({ ...profile, experience: exp as 'beginner' | 'intermediate' | 'advanced' })}
                        className={`py-2.5 rounded-xl font-medium transition-colors ${
                          profile.experience === exp
                            ? 'bg-primary-500 text-white'
                            : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                        }`}
                      >
                        {experienceLabels[exp]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 保存按钮 */}
            <button
              onClick={handleSaveProfile}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              {saved ? '✓ 已保存' : '保存个人信息'}
            </button>
          </div>
        )}

        {/* 训练目标 */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            {/* 体重目标 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
              <h3 className="font-semibold text-primary-800 mb-4">体重目标</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">目标体重 (kg)</label>
                  <input
                    type="number"
                    value={goals.targetWeight}
                    onChange={(e) => setGoals({ ...goals, targetWeight: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">目标体脂率 (%)</label>
                  <input
                    type="number"
                    value={goals.targetBodyFat}
                    onChange={(e) => setGoals({ ...goals, targetBodyFat: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 训练目标 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
              <h3 className="font-semibold text-primary-800 mb-4">训练目标</h3>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  每周训练次数：{goals.weeklyWorkouts} 次
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={goals.weeklyWorkouts}
                  onChange={(e) => setGoals({ ...goals, weeklyWorkouts: parseInt(e.target.value) })}
                  className="w-full h-2 bg-primary-200 rounded-full appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between mt-2 text-xs text-primary-500">
                  <span>1次</span>
                  <span>3次</span>
                  <span>5次</span>
                  <span>7次</span>
                </div>
              </div>
            </div>

            {/* 营养目标 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
              <h3 className="font-semibold text-primary-800 mb-4">营养目标</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">每日热量 (kcal)</label>
                  <input
                    type="number"
                    value={goals.dailyCalories}
                    onChange={(e) => setGoals({ ...goals, dailyCalories: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">蛋白质 (g)</label>
                    <input
                      type="number"
                      value={goals.dailyProtein}
                      onChange={(e) => setGoals({ ...goals, dailyProtein: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">碳水 (g)</label>
                    <input
                      type="number"
                      value={goals.dailyCarbs}
                      onChange={(e) => setGoals({ ...goals, dailyCarbs: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">脂肪 (g)</label>
                    <input
                      type="number"
                      value={goals.dailyFat}
                      onChange={(e) => setGoals({ ...goals, dailyFat: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 保存按钮 */}
            <button
              onClick={handleSaveGoals}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              {saved ? '✓ 已保存' : '保存训练目标'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

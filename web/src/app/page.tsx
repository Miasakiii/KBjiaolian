'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import DashboardStats from '@/components/DashboardStats';
import QuickActions from '@/components/QuickActions';
import TodayTasks from '@/components/TodayTasks';
import RecentActivity from '@/components/RecentActivity';
import { DashboardSkeleton } from '@/components/Skeleton';
import { getDashboardData, DashboardData } from '@/lib/dashboard';
import {
  Camera, Dumbbell, Apple, Bot, BarChart3, ClipboardList,
  Footprints, Utensils, TrendingUp, Download, BookOpen,
  BatteryCharging, Settings, Info, User, ArrowRight, Crown,
} from 'lucide-react';

// ==================== 落地页 ====================

function LandingPage() {
  const features = [
    { icon: <Camera size={24} />, title: 'AI 体态分析', desc: '拍照即可获得 8 维度专业体态评估，识别头前伸、圆肩、骨盆前倾等问题', color: 'from-blue-500 to-blue-600' },
    { icon: <Dumbbell size={24} />, title: '智能训练方案', desc: '根据体态分析结果，AI 生成渐进式超负荷训练计划', color: 'from-purple-500 to-purple-600' },
    { icon: <Apple size={24} />, title: '饮食识别', desc: '拍照识别食物，自动计算热量和营养成分，科学管理饮食', color: 'from-green-500 to-green-600' },
    { icon: <Bot size={24} />, title: 'AI 教练对话', desc: '随时咨询健身、营养、体态问题，获得流式响应的专业建议', color: 'from-orange-500 to-orange-600' },
  ];

  const stats = [
    { value: '8', label: '评估维度' },
    { value: '28', label: '标准动作' },
    { value: '4周', label: '恢复追踪' },
    { value: '24/7', label: 'AI 在线' },
  ];

  const testimonials = [
    { name: '小王', role: '程序员 · 28岁', initial: '王', text: '圆肩改善了很多，同事都说我体态变好了。拍照分析太方便了！' },
    { name: '小李', role: '设计师 · 25岁', initial: '李', text: 'AI 生成的训练方案很专业，跟着练了 2 个月腰痛明显减轻。' },
    { name: '张教练', role: '健身教练 · 32岁', initial: '张', text: '推荐给我的学员用，动作库和恢复追踪功能非常实用。' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-5xl mx-auto px-5 pt-20 pb-24 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm">
            <Crown size={14} />
            <span>AI 驱动 · 拍照即分析</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            拍一张照<br />
            <span className="bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">Know Your Body</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            AI 驱动的体态评估与康复矫正专家，8 维度分析、智能训练方案、饮食管理，一站式解决
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl text-lg hover:bg-gray-100 active:scale-[0.98] transition-all shadow-lg"
            >
              免费开始
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-medium rounded-2xl text-lg hover:bg-white/20 active:scale-[0.98] transition-all border border-white/20"
            >
              了解更多
            </Link>
          </div>
        </div>
      </section>

      {/* 数据亮点 */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">四大核心功能</h2>
            <p className="text-gray-500">从评估到训练，AI 全程陪伴</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group">
                <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 使用流程 */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">三步开始</h2>
            <p className="text-gray-500">简单操作，专业结果</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: <Camera size={28} />, title: '拍照上传', desc: '站直拍一张全身照，AI 自动识别体态问题' },
              { step: '02', icon: <BarChart3 size={28} />, title: '获取报告', desc: '8 维度评分 + 问题分析 + 改善建议' },
              { step: '03', icon: <Dumbbell size={28} />, title: '开始训练', desc: 'AI 生成个性化方案，跟着练就行' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-gray-700">
                  {s.icon}
                </div>
                <div className="text-sm font-bold text-gray-400 mb-2">STEP {s.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 用户评价 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">用户说</h2>
            <p className="text-gray-500">真实反馈，持续改进</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                    {t.initial}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 定价预览 */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">简单定价</h2>
            <p className="text-gray-500">免费版足够体验，Pro 解锁全部能力</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">免费版</h3>
              <div className="text-3xl font-bold text-gray-400 mb-4">¥0</div>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-center gap-2"><Check size={14} className="text-gray-400" /> 每日 2 次体态分析</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-gray-400" /> 每日 1 次训练方案</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-gray-400" /> 每日 2 次饮食识别</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-gray-400" /> 每日 5 次 AI 对话</li>
              </ul>
              <Link href="/login" className="block text-center py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                免费注册
              </Link>
            </div>
            <div className="rounded-2xl border-2 border-gray-900 p-6 relative">
              <div className="absolute -top-3 right-4 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">推荐</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Pro 年度</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">¥168<span className="text-base font-normal text-gray-400">/年</span></div>
              <div className="text-xs text-gray-400 mb-4">折合 ¥14/月，省 53%</div>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-center gap-2"><Check size={14} className="text-gray-900" /> 每日 25 次体态分析</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-gray-900" /> 每日 10 次训练方案</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-gray-900" /> 每日 25 次饮食识别</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-gray-900" /> 每日 100 次 AI 对话</li>
              </ul>
              <Link href="/login" className="block text-center py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                升级 Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-5">
          <h2 className="text-3xl font-bold mb-4">准备好改变了吗？</h2>
          <p className="text-gray-400 mb-8">一分钟注册，开启你的体态改善之旅</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-gray-900 font-bold rounded-2xl text-lg hover:bg-gray-100 active:scale-[0.98] transition-all"
          >
            立即免费开始
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* 底部 */}
      <footer className="bg-gray-900 border-t border-gray-800 text-gray-400 py-10">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Dumbbell size={18} className="text-white" />
          </div>
          <div className="text-white font-bold mb-2">KB教练</div>
          <p className="text-sm mb-4">AI 驱动的体态评估与康复矫正专家</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/about" className="hover:text-white transition-colors">关于我们</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">定价</Link>
            <Link href="/login" className="hover:text-white transition-colors">登录</Link>
          </div>
          <div className="mt-6 text-xs text-gray-500">&copy; 2026 KB教练. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

// ==================== 仪表盘 ====================

function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    };
    loadData();

    const hour = new Date().getHours();
    if (hour < 6) setGreeting('夜深了');
    else if (hour < 12) setGreeting('早上好');
    else if (hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');
  }, []);

  if (!data) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-12">
          <DashboardSkeleton />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 头部欢迎区域 */}
      <header className="pt-12 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center">
              <Dumbbell size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
              <p className="text-gray-500">欢迎使用 KB教练</p>
            </div>
          </div>

          {/* 每日一言 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
            <p className="text-gray-600 text-center text-sm">
              &ldquo;坚持训练，你会看到改变。&rdquo;
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-12 space-y-8">
        {/* 数据统计 */}
        <section>
          <DashboardStats
            latestScore={data.latestScore}
            scoreTrend={data.scoreTrend}
            workoutStats={data.workoutStats}
            nutrition={data.nutrition}
          />
        </section>

        {/* 快捷操作 */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
          <QuickActions />
        </section>

        {/* 今日任务和最近活动 */}
        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <TodayTasks tasks={data.todayTasks} />
          </section>
          <section>
            <RecentActivity activities={data.recentActivities} />
          </section>
        </div>

        {/* 更多功能 */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">更多功能</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/plans', icon: <ClipboardList size={20} />, label: '训练方案' },
              { href: '/compare', icon: <BarChart3 size={20} />, label: '进度对比' },
              { href: '/workouts', icon: <Footprints size={20} />, label: '训练记录' },
              { href: '/nutrition/history', icon: <Utensils size={20} />, label: '饮食历史' },
              { href: '/progress', icon: <TrendingUp size={20} />, label: '进度趋势' },
              { href: '/export', icon: <Download size={20} />, label: '数据导出' },
              { href: '/exercises', icon: <BookOpen size={20} />, label: '动作库' },
              { href: '/recovery', icon: <BatteryCharging size={20} />, label: '恢复追踪' },
              { href: '/settings', icon: <Settings size={20} />, label: '个人设置' },
              { href: '/about', icon: <Info size={20} />, label: '关于' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="block">
                <div className="bg-white rounded-xl p-4 text-center hover:shadow-sm border border-gray-100 transition-all">
                  <div className="text-gray-600 flex justify-center mb-2">{item.icon}</div>
                  <div className="text-sm text-gray-700">{item.label}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

// ==================== 首页（分流） ====================

import { Check } from 'lucide-react';

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, []);

  if (loggedIn === null) return null;

  return loggedIn ? <DashboardPage /> : <LandingPage />;
}

'use client';

import { useEffect, useRef } from 'react';
import {
  Camera, Dumbbell, Apple, Bot, Download, ArrowRight,
  Check, Smartphone, Shield, Zap, Star, ChevronRight,
} from 'lucide-react';

/* ── 滚动渐入 Hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

/* ── 数据 ── */
const features = [
  { icon: <Camera size={24} />, title: 'AI 体态分析', desc: '拍照即可获得 8 维度专业体态评估，精准识别头前伸、圆肩、骨盆前倾等问题', span: 'md:col-span-2 md:row-span-2' },
  { icon: <Dumbbell size={24} />, title: '智能训练方案', desc: '根据分析结果生成渐进式超负荷训练计划', span: '' },
  { icon: <Apple size={24} />, title: '饮食识别', desc: '拍照识别食物，自动计算热量与营养成分', span: '' },
  { icon: <Bot size={24} />, title: 'AI 教练对话', desc: '随时咨询健身、营养、体态问题，获得专业建议', span: 'md:col-span-2' },
];

const stats = [
  { value: '8', label: '评估维度' },
  { value: '28', label: '标准动作' },
  { value: '4 周', label: '恢复追踪' },
  { value: '24/7', label: 'AI 在线' },
];

const steps = [
  { num: '01', title: '拍照上传', desc: '站直拍一张全身照，AI 自动识别体态问题' },
  { num: '02', title: '获取报告', desc: '8 维度评分 + 问题分析 + 改善建议' },
  { num: '03', title: '开始训练', desc: 'AI 生成个性化方案，跟着练就行' },
];

const testimonials = [
  { name: '小王', role: '程序员 · 28 岁', initial: '王', text: '圆肩改善了很多，同事都说我体态变好了。拍照分析太方便了！' },
  { name: '小李', role: '设计师 · 25 岁', initial: '李', text: 'AI 生成的训练方案很专业，跟着练了 2 个月腰痛明显减轻。' },
  { name: '张教练', role: '健身教练 · 32 岁', initial: '张', text: '推荐给我的学员用，动作库和恢复追踪功能非常实用。' },
];

const pricing = [
  {
    name: '免费版',
    price: '¥0',
    features: ['每日 2 次体态分析', '每日 1 次训练方案', '每日 2 次饮食识别', '每日 5 次 AI 对话'],
  },
  {
    name: 'Pro 年度',
    price: '¥168',
    badge: '推荐',
    sub: '/年',
    note: '折合 ¥14/月，省 53%',
    features: ['每日 25 次体态分析', '每日 10 次训练方案', '每日 25 次饮食识别', '每日 100 次 AI 对话'],
    highlight: true,
  },
];

const faqs = [
  { q: '如何开始使用 KB教练？', a: '下载 APP 后，拍照上传即可获得体态分析报告，无需复杂设置。' },
  { q: 'AI 分析准确吗？', a: '基于深度学习模型，8 维度评估准确率超过 90%，持续优化中。' },
  { q: '数据安全吗？', a: '所有数据本地存储，不上传云端，完全保护用户隐私。' },
  { q: '支持哪些设备？', a: '目前支持 Android 设备，iOS 版本开发中，敬请期待。' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm shadow-primary-500/20">
              <Dumbbell size={18} className="text-white" />
            </div>
            <span className="font-bold text-neutral-900 text-lg">KB教练</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors hidden sm:block">功能</a>
            <a href="#pricing" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors hidden sm:block">定价</a>
            <a href="#download" className="px-5 py-2 bg-primary-500 text-white text-sm font-medium rounded-full hover:bg-primary-600 transition-colors shadow-sm shadow-primary-500/20">
              下载 APP
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-28 pb-24 bg-gradient-to-b from-primary-50/60 to-white">
        {/* 背景装饰 */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-100/20 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* 左侧文案 */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200/60 rounded-full px-4 py-1.5 mb-8 text-sm text-primary-700">
                <Zap size={14} className="text-primary-500" />
                <span>AI 驱动 · 拍照即分析</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-neutral-900 mb-6">
                拍一张照
                <br />
                <span className="bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent">
                  Know Your Body
                </span>
              </h1>
              <p className="text-lg text-neutral-500 mb-10 leading-relaxed max-w-lg">
                AI 驱动的体态评估与康复矫正专家。8 维度分析、智能训练方案、饮食管理，一站式解决。
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#download"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 text-white font-semibold rounded-2xl hover:bg-primary-600 active:scale-[0.98] transition-all shadow-lg shadow-primary-500/25"
                >
                  <Download size={18} />
                  免费下载
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-neutral-700 font-medium rounded-2xl hover:bg-neutral-50 active:scale-[0.98] transition-all border border-neutral-200"
                >
                  了解更多
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

            {/* 右侧手机 Mockup */}
            <div className="hidden md:flex justify-center">
              <div className="relative animate-float">
                {/* 手机外框 */}
                <div className="w-64 h-[520px] bg-neutral-900 rounded-[40px] p-3 shadow-2xl shadow-neutral-900/20">
                  <div className="w-full h-full bg-gradient-to-br from-primary-50 via-white to-primary-50 rounded-[28px] overflow-hidden flex flex-col">
                    {/* 状态栏 */}
                    <div className="h-8 bg-white/80 flex items-center justify-center">
                      <div className="w-20 h-4 bg-neutral-900 rounded-full" />
                    </div>
                    {/* 内容区 */}
                    <div className="flex-1 px-5 pt-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-sm shadow-primary-500/20">
                        <Dumbbell size={20} className="text-white" />
                      </div>
                      <div className="text-sm font-bold text-neutral-900 mb-1">今日体态评分</div>
                      <div className="text-4xl font-bold text-primary-600 mb-1">92</div>
                      <div className="text-xs text-primary-500 mb-6">较上周 +5 分</div>
                      {/* 小卡片 */}
                      <div className="space-y-3">
                        {['头前伸', '圆肩', '骨盆前倾'].map((item, i) => (
                          <div key={i} className="bg-white rounded-xl p-3 border border-primary-100/60 flex items-center justify-between">
                            <span className="text-xs font-medium text-neutral-700">{item}</span>
                            <span className="text-xs font-bold text-primary-600">{[88, 92, 95][i]}分</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* 装饰光晕 */}
                <div className="absolute -inset-8 bg-primary-500/5 rounded-full blur-2xl -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 border-y border-neutral-100">
        <div className="max-w-6xl mx-auto px-6">
          <RevealSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent mb-2">{s.value}</div>
                  <div className="text-sm text-neutral-400">{s.label}</div>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Features (Bento Grid) ── */}
      <section id="features" className="py-24 bg-neutral-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <RevealSection className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">四大核心功能</h2>
            <p className="text-neutral-400">从评估到训练，AI 全程陪伴</p>
          </RevealSection>

          <RevealSection>
            <div className="grid md:grid-cols-4 gap-5">
              {features.map((f, i) => (
                <div
                  key={i}
                  className={`group bg-white rounded-2xl p-7 border border-neutral-100 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all ${f.span}`}
                >
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-5 text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{f.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── How it works (Timeline) ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <RevealSection className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">三步开始</h2>
            <p className="text-neutral-400">简单操作，专业结果</p>
          </RevealSection>

          <RevealSection>
            <div className="max-w-2xl mx-auto">
              {steps.map((s, i) => (
                <div key={s.num} className="flex gap-8 items-start mb-12 last:mb-0">
                  {/* 左侧序号 + 连线 */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-500/20">
                      {s.num}
                    </div>
                    {i < steps.length - 1 && <div className="w-px h-16 bg-primary-200 mt-3" />}
                  </div>
                  {/* 右侧内容 */}
                  <div className="pt-2">
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">{s.title}</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-neutral-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <RevealSection className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">用户说</h2>
            <p className="text-neutral-400">真实反馈，持续改进</p>
          </RevealSection>

          <RevealSection>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-7 border border-neutral-100 hover:shadow-md transition-all relative overflow-hidden">
                  {/* 星级 */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} className="fill-primary-400 text-primary-400" />
                    ))}
                  </div>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {t.initial}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900 text-sm">{t.name}</div>
                      <div className="text-xs text-neutral-400">{t.role}</div>
                    </div>
                  </div>
                  {/* 底部装饰 */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/10 to-emerald-500/10" />
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <RevealSection className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">简单定价</h2>
            <p className="text-neutral-400">免费版足够体验，Pro 解锁全部能力</p>
          </RevealSection>

          <RevealSection>
            <div className="grid md:grid-cols-2 gap-6">
              {pricing.map((p, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-8 relative transition-all hover:-translate-y-1 ${
                    p.highlight
                      ? 'bg-white border-2 border-primary-500 glow-green'
                      : 'bg-white border border-neutral-200'
                  }`}
                >
                  {p.badge && (
                    <div className="absolute -top-3 right-6 bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm shadow-primary-500/20">
                      {p.badge}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{p.name}</h3>
                  <div className="text-3xl font-bold text-neutral-900 mb-1">
                    {p.price}
                    {p.sub && <span className="text-base font-normal text-neutral-400">{p.sub}</span>}
                  </div>
                  {p.note && <div className="text-xs text-primary-500 mb-4">{p.note}</div>}
                  {!p.note && <div className="mb-4" />}
                  <ul className="space-y-3 mb-8 text-sm text-neutral-600">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2.5">
                        <Check size={14} className={p.highlight ? 'text-primary-500' : 'text-neutral-400'} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#download"
                    className={`block text-center py-3.5 rounded-xl font-medium transition-colors ${
                      p.highlight
                        ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm shadow-primary-500/20'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {p.highlight ? '升级 Pro' : '免费下载'}
                  </a>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Download CTA ── */}
      <section id="download" className="py-24 bg-white">
        <div className="max-w-2xl mx-auto px-6">
          <RevealSection>
            <div className="bg-gradient-to-br from-primary-500 to-emerald-500 rounded-3xl p-12 text-center text-white relative overflow-hidden">
              {/* 背景装饰 */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative">
                <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Smartphone size={28} />
                </div>
                <h2 className="text-2xl font-bold mb-3">立即下载 KB教练</h2>
                <p className="text-primary-100 mb-8 text-sm">Android 客户端，安装即用，无需注册即可体验基础功能</p>
                <a
                  href="/api/download/app"
                  className="inline-flex items-center gap-3 px-10 py-4 bg-white text-primary-700 font-bold rounded-2xl text-lg hover:bg-primary-50 active:scale-[0.98] transition-all shadow-lg"
                >
                  <Download size={20} />
                  下载 APK 安装包
                </a>
                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-primary-100">
                  <div className="flex items-center gap-1.5">
                    <Shield size={13} />
                    <span>安全无毒</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap size={13} />
                    <span>秒级安装</span>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-neutral-50/50">
        <div className="max-w-3xl mx-auto px-6">
          <RevealSection className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">常见问题</h2>
          </RevealSection>

          <RevealSection>
            <div className="space-y-4">
              {faqs.map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-neutral-100 hover:border-primary-200 transition-colors">
                  <h3 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                    <ChevronRight size={16} className="text-primary-500" />
                    {item.q}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed pl-6">{item.a}</p>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Dumbbell size={16} className="text-white" />
              </div>
              <span className="text-white font-bold">KB教练</span>
            </div>
            <div className="flex gap-8 text-sm">
              <a href="#features" className="hover:text-white transition-colors">功能</a>
              <a href="#pricing" className="hover:text-white transition-colors">定价</a>
              <a href="#download" className="hover:text-white transition-colors">下载</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-xs text-neutral-500">
            © 2026 KB教练. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

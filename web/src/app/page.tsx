'use client';

import {
  Camera, Dumbbell, Apple, Bot, Download, ArrowRight,
  Check, Smartphone, Star, Shield, Zap, Heart,
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <Camera size={28} />,
      title: 'AI 体态分析',
      desc: '拍照即可获得 8 维度专业体态评估，识别头前伸、圆肩、骨盆前倾等问题',
    },
    {
      icon: <Dumbbell size={28} />,
      title: '智能训练方案',
      desc: '根据体态分析结果，AI 生成渐进式超负荷训练计划',
    },
    {
      icon: <Apple size={28} />,
      title: '饮食识别',
      desc: '拍照识别食物，自动计算热量和营养成分，科学管理饮食',
    },
    {
      icon: <Bot size={28} />,
      title: 'AI 教练对话',
      desc: '随时咨询健身、营养、体态问题，获得流式响应的专业建议',
    },
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

  const pricing = [
    {
      name: '免费版',
      price: '¥0',
      features: [
        '每日 2 次体态分析',
        '每日 1 次训练方案',
        '每日 2 次饮食识别',
        '每日 5 次 AI 对话',
      ],
    },
    {
      name: 'Pro 年度',
      price: '¥168',
      badge: '推荐',
      sub: '/年',
      note: '折合 ¥14/月，省 53%',
      features: [
        '每日 25 次体态分析',
        '每日 10 次训练方案',
        '每日 25 次饮食识别',
        '每日 100 次 AI 对话',
      ],
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary-100">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Dumbbell size={18} className="text-white" />
            </div>
            <span className="font-bold text-primary-800">KB教练</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-primary-600 hover:text-primary-800 hidden sm:block">功能</a>
            <a href="#pricing" className="text-sm text-primary-600 hover:text-primary-800 hidden sm:block">定价</a>
            <a
              href="#download"
              className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              下载 APP
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-emerald-50 pt-24 pb-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMmM1NWUiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-5xl mx-auto px-5 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-4 py-1.5 mb-6 text-sm text-primary-700">
            <Zap size={14} />
            <span>AI 驱动 · 拍照即分析</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-primary-900">
            拍一张照<br />
            <span className="bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent">Know Your Body</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-500 mb-10 max-w-2xl mx-auto">
            AI 驱动的体态评估与康复矫正专家，8 维度分析、智能训练方案、饮食管理，一站式解决
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#download"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 text-white font-bold rounded-2xl text-lg hover:bg-primary-600 active:scale-[0.98] transition-all shadow-lg shadow-primary-500/25"
            >
              <Download size={20} />
              免费下载 APP
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-medium rounded-2xl text-lg hover:bg-primary-50 active:scale-[0.98] transition-all border border-primary-200"
            >
              了解更多
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b border-primary-100">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent mb-1">{s.value}</div>
                <div className="text-sm text-primary-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-primary-50">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-primary-800 mb-3">四大核心功能</h2>
            <p className="text-primary-400">从评估到训练，AI 全程陪伴</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-primary-100 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-primary-800 mb-2">{f.title}</h3>
                <p className="text-primary-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-primary-800 mb-3">三步开始</h2>
            <p className="text-primary-400">简单操作，专业结果</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: <Camera size={28} />, title: '拍照上传', desc: '站直拍一张全身照，AI 自动识别体态问题' },
              { step: '02', icon: <Star size={28} />, title: '获取报告', desc: '8 维度评分 + 问题分析 + 改善建议' },
              { step: '03', icon: <Dumbbell size={28} />, title: '开始训练', desc: 'AI 生成个性化方案，跟着练就行' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary-600">
                  {s.icon}
                </div>
                <div className="text-sm font-bold bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent mb-2">STEP {s.step}</div>
                <h3 className="text-lg font-bold text-primary-800 mb-2">{s.title}</h3>
                <p className="text-primary-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-primary-800 mb-3">用户说</h2>
            <p className="text-primary-400">真实反馈，持续改进</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-primary-100">
                <p className="text-primary-600 text-sm leading-relaxed mb-4">“{t.text}”</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {t.initial}
                  </div>
                  <div>
                    <div className="font-medium text-primary-800 text-sm">{t.name}</div>
                    <div className="text-xs text-primary-300">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-primary-800 mb-3">简单定价</h2>
            <p className="text-primary-400">免费版足够体验，Pro 解锁全部能力</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {pricing.map((p, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 relative ${
                  p.highlight
                    ? 'border-2 border-primary-500 shadow-lg shadow-primary-500/10'
                    : 'border border-primary-200'
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3 right-4 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {p.badge}
                  </div>
                )}
                <h3 className="text-lg font-bold text-primary-800 mb-1">{p.name}</h3>
                <div className="text-3xl font-bold text-primary-700 mb-1">
                  {p.price}
                  {p.sub && <span className="text-base font-normal text-primary-400">{p.sub}</span>}
                </div>
                {p.note && <div className="text-xs text-primary-300 mb-4">{p.note}</div>}
                {!p.note && <div className="mb-4" />}
                <ul className="space-y-2 mb-6 text-sm text-primary-600">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <Check size={14} className={p.highlight ? 'text-primary-600' : 'text-primary-400'} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#download"
                  className={`block text-center py-3 rounded-xl font-medium transition-colors ${
                    p.highlight
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  {p.highlight ? '升级 Pro' : '免费下载'}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section id="download" className="py-20 bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-500 text-white text-center">
        <div className="max-w-2xl mx-auto px-5">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Smartphone size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-4">立即下载 KB教练</h2>
          <p className="text-primary-100 mb-8">Android 客户端，安装即用，无需注册即可体验基础功能</p>
          <a
            href="/api/download/app"
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-primary-700 font-bold rounded-2xl text-lg hover:bg-primary-50 active:scale-[0.98] transition-all shadow-lg"
          >
            <Download size={22} />
            下载 APK 安装包
          </a>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-primary-100">
            <div className="flex items-center gap-1">
              <Shield size={14} />
              <span>安全无毒</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart size={14} />
              <span>完全免费</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={14} />
              <span>秒级安装</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-primary-800 mb-3">常见问题</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: '如何开始使用 KB教练？', a: '下载 APP 后，拍照上传即可获得体态分析报告，无需复杂设置。' },
              { q: 'AI 分析准确吗？', a: '基于深度学习模型，8 维度评估准确率超过 90%，持续优化中。' },
              { q: '数据安全吗？', a: '所有数据本地存储，不上传云端，完全保护用户隐私。' },
              { q: '支持哪些设备？', a: '目前支持 Android 设备，iOS 版本开发中，敬请期待。' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-primary-100">
                <h3 className="font-bold text-primary-800 mb-2">{item.q}</h3>
                <p className="text-sm text-primary-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-primary-300 py-10">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Dumbbell size={18} className="text-white" />
            </div>
            <span className="text-white font-bold">KB教练</span>
          </div>
          <p className="text-sm mb-6">AI 驱动的体态评估与康复矫正专家</p>
          <div className="flex justify-center gap-6 text-sm mb-6">
            <a href="#features" className="hover:text-white transition-colors">功能</a>
            <a href="#pricing" className="hover:text-white transition-colors">定价</a>
            <a href="#download" className="hover:text-white transition-colors">下载</a>
          </div>
          <div className="text-xs text-primary-400">© 2026 KB教练. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

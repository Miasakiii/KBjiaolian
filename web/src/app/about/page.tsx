'use client';

import Link from 'next/link';

const features = [
  {
    icon: '📸',
    title: 'AI 体态分析',
    description: '拍照即可获得专业体态评估，识别圆肩、头前伸、骨盆前倾等问题',
  },
  {
    icon: '🏋️',
    title: '个性化训练方案',
    description: '根据体态分析结果，AI 生成针对性训练计划',
  },
  {
    icon: '🍎',
    title: '饮食识别',
    description: '拍照识别食物，自动计算热量和营养成分',
  },
  {
    icon: '🤖',
    title: 'AI 教练',
    description: '随时咨询健身、营养、体态问题，获得专业建议',
  },
  {
    icon: '📊',
    title: '进度追踪',
    description: '可视化数据图表，直观了解体态变化趋势',
  },
  {
    icon: '📤',
    title: '数据导出',
    description: '支持 JSON/CSV 格式导出，数据完全由你掌控',
  },
];

const techStack = [
  { name: 'Next.js 14', category: '前端框架' },
  { name: 'TypeScript', category: '类型安全' },
  { name: 'Tailwind CSS', category: '样式系统' },
  { name: 'Express.js', category: '后端框架' },
  { name: 'MiMo API', category: 'AI 能力' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <header className="text-center pt-16 pb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
          <span className="text-4xl">💪</span>
        </div>
        <h1 className="text-4xl font-bold text-primary-800 mb-3">KB教练</h1>
        <p className="text-xl text-primary-600">AI 驱动的健身康复师</p>
        <p className="text-primary-500 mt-2">拍张照，练出型</p>
      </header>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* 产品介绍 */}
        <section className="mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-8">
            <h2 className="text-2xl font-bold text-primary-800 mb-4">产品介绍</h2>
            <p className="text-primary-700 leading-relaxed mb-4">
              KB教练是一款 AI 驱动的健身康复应用，专为久坐白领、健身新手和体态问题人群设计。
            </p>
            <p className="text-primary-700 leading-relaxed">
              通过先进的 AI 技术，我们提供专业的体态分析、个性化训练方案、饮食指导和智能问答服务，
              帮助用户科学健身，改善体态，提升生活质量。
            </p>
          </div>
        </section>

        {/* 核心功能 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-primary-800 mb-8 text-center">核心功能</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6 hover:shadow-lg hover:border-primary-300 transition-all"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="font-semibold text-primary-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-primary-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 技术栈 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-primary-800 mb-8 text-center">技术栈</h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {techStack.map((tech) => (
                <div key={tech.name} className="text-center p-4 bg-primary-50 rounded-xl">
                  <div className="font-semibold text-primary-800">{tech.name}</div>
                  <div className="text-sm text-primary-500">{tech.category}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 数据安全 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-primary-800 mb-8 text-center">数据安全</h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="font-semibold text-primary-800 mb-2">本地存储</h3>
                <p className="text-sm text-primary-600">所有数据存储在你的浏览器，不上传服务器</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📤</span>
                </div>
                <h3 className="font-semibold text-primary-800 mb-2">自由导出</h3>
                <p className="text-sm text-primary-600">支持 JSON/CSV 格式导出，数据完全由你掌控</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🗑️</span>
                </div>
                <h3 className="font-semibold text-primary-800 mb-2">随时删除</h3>
                <p className="text-sm text-primary-600">可以随时清空所有数据，保护个人隐私</p>
              </div>
            </div>
          </div>
        </section>

        {/* 开始使用 */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-primary-800 mb-4">开始使用</h2>
          <p className="text-primary-600 mb-8">只需一分钟，开启你的健身之旅</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/analyze"
              className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              体态分析
            </Link>
            <Link
              href="/"
              className="px-8 py-3 bg-white hover:bg-primary-50 text-primary-700 font-medium rounded-xl border border-primary-200 transition-colors"
            >
              返回首页
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

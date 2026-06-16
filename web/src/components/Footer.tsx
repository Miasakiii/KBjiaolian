export default function Footer() {
  return (
    <footer className="bg-white/60 backdrop-blur-sm border-t border-primary-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-lg">💪</span>
              </div>
              <span className="font-bold text-primary-800">KB教练</span>
            </div>
            <p className="text-primary-600 text-sm leading-relaxed">
              AI 驱动的智能健身康复助手，帮你科学分析体态，定制专属训练方案。
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-primary-800 mb-3">功能</h4>
            <ul className="space-y-2 text-sm text-primary-600">
              <li>📸 体态分析</li>
              <li>🏋️ 训练方案</li>
              <li>📊 进度追踪</li>
              <li>🍎 饮食管理</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-primary-800 mb-3">关于</h4>
            <ul className="space-y-2 text-sm text-primary-600">
              <li>使用条款</li>
              <li>隐私政策</li>
              <li>联系我们</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-100 mt-8 pt-6 text-center text-sm text-primary-500">
          © 2026 KB教练. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

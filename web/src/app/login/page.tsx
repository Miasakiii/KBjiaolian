'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register, login } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await register(email, password, nickname || undefined);
      } else {
        await login(email, password);
      }
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-3xl">💪</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary-800">KB教练</h1>
          <p className="text-primary-600 mt-1">
            {mode === 'login' ? '登录你的账号' : '创建新账号'}
          </p>
        </div>

        {/* 表单 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6 shadow-lg">
          {/* 模式切换 */}
          <div className="flex gap-2 mb-6 bg-primary-50 rounded-xl p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-primary-500 hover:text-primary-700'
              }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-primary-500 hover:text-primary-700'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none text-sm"
              />
            </div>

            {/* 昵称（仅注册） */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  昵称 <span className="text-primary-400 font-normal">(可选)</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="给自己起个名字"
                  className="w-full px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none text-sm"
                />
              </div>
            )}

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="至少 6 个字符"
                className="w-full px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none text-sm"
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-xl transition-colors"
            >
              {loading
                ? '处理中...'
                : mode === 'login'
                ? '登录'
                : '注册'}
            </button>
          </form>

          {/* 跳过登录 */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-sm text-primary-500 hover:text-primary-700 transition-colors"
            >
              先体验一下 →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

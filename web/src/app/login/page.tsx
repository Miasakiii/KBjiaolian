'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { login, getRedirectPath, clearRedirectPath } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';
import { Dumbbell, Mail, Lock, User, ArrowLeft, Shield } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function LoginPage() {
  const router = useRouter();
  const { enterGuestMode } = useAuth();

  // 登录/注册切换
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // 登录字段
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 注册字段
  const [regStep, setRegStep] = useState<'email' | 'code'>('email');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regNickname, setRegNickname] = useState('');
  const [regCode, setRegCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 冷却倒计时
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // === 登录 ===
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('登录成功');
      redirectAfterLogin();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // === 发送验证码 ===
  const handleSendCode = async () => {
    if (!regEmail) { setError('请输入邮箱'); return; }
    setError('');
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, type: 'register' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCodeSent(true);
      setRegStep('code');
      setCooldown(60);
      toast.success('验证码已发送到邮箱');
      // 开发模式提示
      if (data.devHint) toast.info(data.devHint, { duration: 8000 });
      setTimeout(() => codeInputRef.current?.focus(), 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '发送失败');
    } finally {
      setSending(false);
    }
  };

  // === 注册提交 ===
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          nickname: regNickname || undefined,
          code: regCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 保存 token
      localStorage.setItem('kb-coach-token', data.token);
      localStorage.setItem('kb-coach-user', JSON.stringify(data.user));
      toast.success('注册成功');
      redirectAfterLogin();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const redirectAfterLogin = () => {
    const redirectPath = getRedirectPath();
    if (redirectPath) {
      clearRedirectPath();
      router.push(redirectPath);
    } else {
      router.push('/');
    }
    router.refresh();
  };

  const handleGuestMode = () => {
    enterGuestMode();
    router.push('/');
  };

  const resetRegister = () => {
    setRegStep('email');
    setCodeSent(false);
    setRegCode('');
    setError('');
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Dumbbell size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">KB教练</h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'login' ? '登录你的账号' : '创建新账号'}
          </p>
        </div>

        {/* 表单卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {/* 模式切换 */}
          <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setRegStep('email'); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              注册
            </button>
          </div>

          {/* === 登录表单 === */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="至少 6 个字符"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-sm"
                  />
                </div>
              </div>
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  忘记密码？
                </Link>
              </div>
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors text-sm"
              >
                {loading ? '处理中...' : '登录'}
              </button>
            </form>
          )}

          {/* === 注册表单 === */}
          {mode === 'register' && (
            <>
              {/* Step 1: 输入邮箱 */}
              {regStep === 'email' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="至少 6 个字符"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      昵称 <span className="text-gray-400 font-normal">(可选)</span>
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={regNickname}
                        onChange={(e) => setRegNickname(e.target.value)}
                        placeholder="给自己起个名字"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sending || !regEmail || !regPassword}
                    className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors text-sm"
                  >
                    {sending ? '发送中...' : '发送验证码'}
                  </button>
                </div>
              )}

              {/* Step 2: 输入验证码 */}
              {regStep === 'code' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                    <Shield size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">验证码已发送至</div>
                      <div className="text-sm font-medium text-gray-900 truncate">{regEmail}</div>
                    </div>
                    <button
                      type="button"
                      onClick={resetRegister}
                      className="text-xs text-gray-500 hover:text-gray-900"
                    >
                      更换
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
                    <input
                      ref={codeInputRef}
                      type="text"
                      value={regCode}
                      onChange={(e) => setRegCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      placeholder="6 位数字验证码"
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-sm tracking-[0.3em] font-mono text-center"
                    />
                  </div>

                  <div className="text-center">
                    {cooldown > 0 ? (
                      <span className="text-xs text-gray-400">{cooldown} 秒后可重新发送</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={sending}
                        className="text-xs text-gray-500 hover:text-gray-900"
                      >
                        重新发送验证码
                      </button>
                    )}
                  </div>

                  {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}
                  <button
                    type="submit"
                    disabled={loading || regCode.length !== 6}
                    className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors text-sm"
                  >
                    {loading ? '注册中...' : '完成注册'}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    提示：验证码已打印到后端控制台
                  </p>
                </form>
              )}
            </>
          )}
        </div>

        {/* 游客模式 */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleGuestMode}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            先体验一下
          </button>
          <p className="text-xs text-gray-400 mt-1">游客模式下数据仅保存在本地</p>
        </div>
      </div>
    </main>
  );
}

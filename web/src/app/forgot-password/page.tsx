'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Dumbbell, Mail, Lock, Shield } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleSendCode = async () => {
    if (!email) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep('code');
      setCooldown(60);
      toast.success('验证码已发送');
      if (data.devHint) toast.info(data.devHint, { duration: 8000 });
      setTimeout(() => codeRef.current?.focus(), 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '发送失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep('done');
      toast.success('密码重置成功');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '重置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Dumbbell size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">找回密码</h1>
          <p className="text-gray-500 text-sm mt-1">通过邮箱验证码重置密码</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {/* Step 1: 输入邮箱 */}
          {step === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">注册邮箱</label>
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
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}
              <button
                type="button"
                onClick={handleSendCode}
                disabled={loading || !email}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors text-sm"
              >
                {loading ? '发送中...' : '发送验证码'}
              </button>
            </div>
          )}

          {/* Step 2: 输入验证码 + 新密码 */}
          {step === 'code' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                <Shield size={16} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500">验证码已发送至</div>
                  <div className="text-sm font-medium text-gray-900 truncate">{email}</div>
                </div>
                <button type="button" onClick={() => { setStep('email'); setError(''); }} className="text-xs text-gray-500 hover:text-gray-900">更换</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
                <input
                  ref={codeRef}
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  placeholder="6 位数字验证码"
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-sm tracking-[0.3em] font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="至少 6 个字符"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="text-center">
                {cooldown > 0 ? (
                  <span className="text-xs text-gray-400">{cooldown} 秒后可重新发送</span>
                ) : (
                  <button type="button" onClick={handleSendCode} disabled={loading} className="text-xs text-gray-500 hover:text-gray-900">重新发送验证码</button>
                )}
              </div>

              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}
              <button
                type="submit"
                disabled={loading || code.length !== 6 || !newPassword}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors text-sm"
              >
                {loading ? '重置中...' : '重置密码'}
              </button>
            </form>
          )}

          {/* Step 3: 完成 */}
          {step === 'done' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <Shield size={24} className="text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">密码重置成功</div>
                <div className="text-sm text-gray-500 mt-1">请使用新密码登录</div>
              </div>
              <Link
                href="/login"
                className="inline-block w-full py-2.5 bg-gray-900 text-white font-medium rounded-xl text-sm text-center hover:bg-gray-800 transition-colors"
              >
                去登录
              </Link>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            返回登录
          </Link>
        </div>
      </div>
    </main>
  );
}

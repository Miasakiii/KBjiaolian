'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getToken, logout, isAuthenticated } from '@/lib/auth'
import {
  Settings, BarChart3, Footprints, Download, LogOut,
  Crown, Package, Camera, ClipboardList, Apple, MessageCircle,
  ChevronRight, Calendar, CreditCard, User,
} from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface ProfileData {
  id: string
  email: string
  nickname: string
  plan: string
  planExpiresAt: number | null
  createdAt: number
}

interface QuotaData {
  plan: string
  planName: string
  usage: Record<string, { used: number; limit: number; remaining: number }>
}

interface OrderItem {
  id: string
  plan: string
  planName: string
  amountYuan: string
  status: string
  paid_at: number | null
  created_at: number
}

const PLAN_LABELS: Record<string, string> = {
  free: '免费版',
  pro_monthly: 'Pro 月度',
  pro_yearly: 'Pro 年度',
}

const QUOTA_ICONS: Record<string, React.ReactNode> = {
  analyze: <Camera size={16} />,
  plan: <ClipboardList size={16} />,
  nutrition: <Apple size={16} />,
  chat: <MessageCircle size={16} />,
}

const QUOTA_NAMES: Record<string, string> = {
  analyze: '体态分析',
  plan: '训练方案',
  nutrition: '饮食识别',
  chat: 'AI 对话',
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [quota, setQuota] = useState<QuotaData | null>(null)
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login?redirect=/profile')
      return
    }

    const token = getToken()
    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(`${API_BASE}/auth/profile`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/quota`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/orders`, { headers }).then(r => r.json()),
    ])
      .then(([profileData, quotaData, ordersData]) => {
        setProfile(profileData)
        setQuota(quotaData)
        setOrders(Array.isArray(ordersData) ? ordersData : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = () => {
    logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    )
  }

  if (!profile) return null

  const isPro = profile.plan !== 'free'
  const initial = (profile.nickname || profile.email || '?')[0].toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部用户信息 */}
      <div className="bg-gray-900 text-white px-5 pt-6 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-base font-bold">个人中心</h1>
            <Link href="/settings" className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
              <Settings size={13} />
              编辑资料
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold truncate">{profile.nickname || '用户'}</span>
                {isPro && (
                  <span className="flex items-center gap-0.5 text-[10px] bg-white/10 px-1.5 py-0.5 rounded flex-shrink-0">
                    <Crown size={10} />
                    Pro
                  </span>
                )}
              </div>
              <div className="text-gray-400 text-xs mt-0.5 truncate">{profile.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-lg mx-auto px-4 pb-24 space-y-3 pt-4">
        {/* 订阅状态 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">订阅</span>
            {!isPro && (
              <Link href="/pricing" className="text-xs text-gray-900 font-medium flex items-center gap-0.5">
                升级 Pro <ChevronRight size={12} />
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isPro ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {isPro ? <Crown size={16} /> : <Package size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">{PLAN_LABELS[profile.plan] || '免费版'}</div>
              {profile.planExpiresAt ? (
                <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <Calendar size={11} />
                  有效期至 {new Date(profile.planExpiresAt).toLocaleDateString('zh-CN')}
                </div>
              ) : profile.plan === 'free' ? (
                <div className="text-[11px] text-gray-400 mt-0.5">基础功能免费使用</div>
              ) : null}
            </div>
            {isPro && (
              <Link href="/pricing" className="text-[11px] text-gray-400 hover:text-gray-600 flex-shrink-0">
                续费
              </Link>
            )}
          </div>
        </div>

        {/* 今日用量 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">今日用量</span>
          {quota ? (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {Object.entries(quota.usage).map(([key, val]) => {
                const pct = val.limit > 0 ? (val.used / val.limit) * 100 : 0
                const exhausted = val.remaining === 0
                return (
                  <div key={key} className="bg-gray-50 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-gray-400">{QUOTA_ICONS[key] || <BarChart3 size={16} />}</span>
                      <span className="text-[11px] text-gray-500">{QUOTA_NAMES[key] || key}</span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full ${exhausted ? 'bg-red-400' : 'bg-gray-900'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-400">{val.used}/{val.limit}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-xs text-gray-400 mt-2">暂无数据</div>
          )}
        </div>

        {/* 快捷入口 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {[
            { href: '/settings', icon: <Settings size={16} />, label: '个人设置' },
            { href: '/history', icon: <BarChart3 size={16} />, label: '分析历史' },
            { href: '/workouts', icon: <Footprints size={16} />, label: '训练记录' },
            { href: '/export', icon: <Download size={16} />, label: '导出数据' },
          ].map((item, i, arr) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <span className="text-gray-400">{item.icon}</span>
              <span className="flex-1 text-sm text-gray-700">{item.label}</span>
              <ChevronRight size={14} className="text-gray-300" />
            </Link>
          ))}
        </div>

        {/* 订单历史 */}
        {orders.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">订单</span>
            <div className="space-y-2.5 mt-3">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                    order.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <CreditCard size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-700 truncate">{order.planName}</div>
                    <div className="text-[10px] text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium text-gray-900">&yen;{order.amountYuan}</div>
                    <div className={`text-[10px] ${order.status === 'paid' ? 'text-green-500' : 'text-gray-400'}`}>
                      {order.status === 'paid' ? '已支付' : order.status === 'pending' ? '待支付' : '已关闭'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 账户信息 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">账户</span>
          <div className="space-y-2 mt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">注册时间</span>
              <span className="text-gray-700">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('zh-CN') : '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">用户 ID</span>
              <span className="text-gray-400 font-mono text-[11px]">{profile.id}</span>
            </div>
          </div>
        </div>

        {/* 退出登录 */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3 bg-white text-red-500 text-sm font-medium rounded-xl border border-gray-200 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <LogOut size={14} />
          退出登录
        </button>
      </div>
    </div>
  )
}

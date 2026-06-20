'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, isAuthenticated, authFetch } from '@/lib/auth'
import { toast } from 'sonner'
import {
  Crown, Check, Camera, Dumbbell, Apple, MessageCircle,
  BarChart3, TrendingUp, Download, Zap, Shield, ArrowRight,
} from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface PlanInfo {
  id: string
  name: string
  price: number
  limits: Record<string, number>
  features: string[]
}

const PLAN_ORDER = ['free', 'pro_monthly', 'pro_yearly']

const PLAN_CONFIG: Record<string, {
  label: string
  price: string
  period: string
  badge: string
  highlight: boolean
  cta: string
}> = {
  free: {
    label: '免费版',
    price: '¥0',
    period: '',
    badge: '',
    highlight: false,
    cta: '当前方案',
  },
  pro_monthly: {
    label: 'Pro 月度',
    price: '¥29.90',
    period: '/月',
    badge: '',
    highlight: false,
    cta: '升级 Pro',
  },
  pro_yearly: {
    label: 'Pro 年度',
    price: '¥168',
    period: '/年',
    badge: '省 53%',
    highlight: true,
    cta: '升级 Pro 年度',
  },
}

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  '体态分析': <Camera size={16} />,
  '训练方案': <Dumbbell size={16} />,
  '饮食识别': <Apple size={16} />,
  'AI 对话': <MessageCircle size={16} />,
  '超负荷': <TrendingUp size={16} />,
  '对比': <BarChart3 size={16} />,
  '恢复': <Zap size={16} />,
  '导出': <Download size={16} />,
  '优先': <Shield size={16} />,
}

function getFeatureIcon(feature: string): React.ReactNode {
  for (const [key, icon] of Object.entries(FEATURE_ICONS)) {
    if (feature.includes(key)) return icon
  }
  return <Check size={16} />
}

export default function PricingPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Record<string, PlanInfo>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('free')

  useEffect(() => {
    fetch(`${API_BASE}/plans`)
      .then(r => r.json())
      .then(setPlans)
      .catch(() => {})

    if (isAuthenticated()) {
      authFetch(`${API_BASE}/auth/profile`)
        .then(r => r.json())
        .then(data => { if (data && data.plan) setCurrentPlan(data.plan) })
        .catch(() => {})
    }
  }, [])

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated()) {
      toast.error('请先登录')
      router.push('/login?redirect=/pricing')
      return
    }

    if (planId === 'free') return

    setLoading(planId)
    try {
      const res = await authFetch(`${API_BASE}/orders`, {
        method: 'POST',
        body: JSON.stringify({ plan: planId }),
      })

      const data = await res.json().catch(() => ({} as Record<string, unknown>))
      if (!res.ok) throw new Error((data && typeof data === 'object' && 'error' in data ? String((data as Record<string, unknown>).error) : '') || '创建订单失败')

      router.push(`/payment?orderId=${(data as { order?: { id?: string } }).order?.id ?? ''}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '创建订单失败'
      toast.error(message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-primary-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-8 pb-16 px-5">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-4 text-sm">
            <Crown size={14} />
            <span>升级 Pro</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">解锁全部 AI 能力</h1>
          <p className="text-primary-300 text-sm">
            线下私教 ¥300/节 — Pro 会员仅 ¥14/月
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="px-5 -mt-8 space-y-4 max-w-lg mx-auto">
        {PLAN_ORDER.map(planId => {
          const plan = plans[planId]
          if (!plan) return null

          const config = PLAN_CONFIG[planId]
          const isCurrent = currentPlan === planId
          const isLoading = loading === planId

          return (
            <div
              key={planId}
              className={`rounded-2xl p-5 transition-all relative ${
                config.highlight
                  ? 'bg-white border-2 border-gray-900 shadow-xl'
                  : 'bg-white border border-primary-200'
              }`}
            >
              {/* Badge */}
              {config.badge && (
                <div className="absolute -top-3 right-5">
                  <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {config.badge}
                  </span>
                </div>
              )}

              {/* Title & Price */}
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-lg font-bold text-primary-800">{config.label}</h3>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary-800">{config.price}</span>
                  {config.period && (
                    <span className="text-sm text-primary-300">{config.period}</span>
                  )}
                </div>
              </div>

              {/* Per-month for yearly */}
              {planId === 'pro_yearly' && (
                <div className="text-xs text-primary-300 mb-4">
                  折合 ¥14/月，比月度省 ¥190.80
                </div>
              )}
              {planId !== 'pro_yearly' && <div className="mb-4" />}

              {/* Features */}
              <ul className="space-y-2.5 mb-5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm">
                    <span className={config.highlight ? 'text-primary-800' : 'text-primary-300'}>
                      {getFeatureIcon(feature)}
                    </span>
                    <span className="text-primary-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <div className="py-3 text-center text-sm font-medium text-primary-300 bg-primary-50 rounded-xl">
                  当前方案
                </div>
              ) : planId === 'free' ? (
                <div className="py-3 text-center text-sm text-primary-300">
                  已包含基础功能
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubscribe(planId)}
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    config.highlight
                      ? 'bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98]'
                      : 'bg-primary-50 text-primary-800 hover:bg-primary-100 active:scale-[0.98]'
                  } disabled:opacity-50`}
                >
                  {isLoading ? '处理中...' : config.cta}
                  {!isLoading && <ArrowRight size={16} />}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Value comparison */}
      <div className="px-5 mt-8 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-primary-200 p-5">
          <h3 className="font-bold text-primary-800 mb-4 text-sm">价值对比</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-primary-400">线下私教课（1节）</span>
              <span className="font-medium text-primary-300 line-through">¥300-500</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-primary-400">健身房月卡</span>
              <span className="font-medium text-primary-300 line-through">¥200-400</span>
            </div>
            <div className="border-t border-primary-100 pt-3 flex items-center justify-between">
              <span className="text-primary-800 font-medium">KB教练 Pro 年度</span>
              <div className="text-right">
                <span className="text-xl font-bold text-primary-800">¥14</span>
                <span className="text-sm text-primary-300">/月</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="px-5 mt-8 max-w-lg mx-auto">
        <h3 className="font-bold text-primary-800 mb-4">常见问题</h3>
        <div className="space-y-3">
          <FaqItem
            question="免费版有什么限制？"
            answer="免费版每天可使用 2 次体态分析、1 次训练方案、2 次饮食识别、5 次 AI 对话，足够初步体验。"
          />
          <FaqItem
            question="可以随时取消订阅吗？"
            answer="可以。取消后当前周期内仍可使用 Pro 功能，到期自动降级为免费版，不会额外扣费。"
          />
          <FaqItem
            question="年度计划更划算吗？"
            answer="年度计划 ¥168/年，折合 ¥14/月，比月度计划节省 ¥190.80（约 53%）。"
          />
          <FaqItem
            question="支持哪些支付方式？"
            answer="支持微信支付，后续将支持支付宝。"
          />
        </div>
      </div>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white border border-primary-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3.5 text-left text-sm font-medium flex justify-between items-center text-primary-800"
      >
        <span>{question}</span>
        <span className="text-primary-300 text-xs">{open ? '收起' : '展开'}</span>
      </button>
      {open && (
        <div className="px-4 pb-3.5 text-sm text-primary-500 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

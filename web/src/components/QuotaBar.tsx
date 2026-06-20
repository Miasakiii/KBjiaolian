'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getToken, authFetch } from '@/lib/auth'
import { Camera, ClipboardList, Apple, MessageCircle, BarChart3 } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface QuotaInfo {
  plan: string
  planName: string
  usage: Record<string, { used: number; limit: number; remaining: number }>
}

const ACTION_LABELS: Record<string, string> = {
  analyze: '体态分析',
  plan: '训练方案',
  nutrition: '饮食识别',
  chat: 'AI 对话',
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  analyze: <Camera size={16} />,
  plan: <ClipboardList size={16} />,
  nutrition: <Apple size={16} />,
  chat: <MessageCircle size={16} />,
}

export default function QuotaBar({ action }: { action?: string }) {
  const [quota, setQuota] = useState<QuotaInfo | null>(null)

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    authFetch(`${API_BASE}/quota`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        if (data && data.usage) setQuota(data)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (!quota || !quota.usage) return null

  // 如果指定了 action，只显示该 action 的配额
  if (action && quota.usage[action]) {
    const { used, limit, remaining } = quota.usage[action]
    const percentage = limit > 0 ? (used / limit) * 100 : 0
    const isLow = remaining <= 1
    const isExhausted = remaining === 0

    return (
      <div className={`rounded-xl p-3 text-sm ${isExhausted ? 'bg-red-50 border border-red-200' : isLow ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">{ACTION_ICONS[action] || <BarChart3 size={16} />}</span>
            <span className="font-medium text-gray-700">{ACTION_LABELS[action] || action}</span>
          </div>
          <span className={`text-xs ${isExhausted ? 'text-red-500 font-medium' : isLow ? 'text-yellow-600' : 'text-gray-400'}`}>
            {used}/{limit}
          </span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isExhausted ? 'bg-red-500' : isLow ? 'bg-yellow-500' : 'bg-gray-900'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {isExhausted && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-red-500">今日次数已用完</span>
            <Link
              href="/pricing"
              className="text-xs text-gray-900 font-medium"
            >
              升级 Pro
            </Link>
          </div>
        )}
        {isLow && !isExhausted && (
          <div className="mt-1 text-xs text-yellow-600">
            今日剩余 {remaining} 次
          </div>
        )}
      </div>
    )
  }

  // 显示所有配额概览
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">今日用量</span>
          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
            {quota.planName}
          </span>
        </div>
        {quota.plan === 'free' && (
          <Link href="/pricing" className="text-xs text-gray-900 font-medium">
            升级 Pro
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(quota.usage).map(([key, val]) => {
          const percentage = val.limit > 0 ? (val.used / val.limit) * 100 : 0
          const isExhausted = val.remaining === 0
          return (
            <div key={key} className="text-center">
              <div className="text-gray-500 flex justify-center mb-1">{ACTION_ICONS[key] || <BarChart3 size={18} />}</div>
              <div className="text-xs text-gray-500 mb-1">{ACTION_LABELS[key] || key}</div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isExhausted ? 'bg-red-400' : 'bg-gray-900'}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {val.used}/{val.limit}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

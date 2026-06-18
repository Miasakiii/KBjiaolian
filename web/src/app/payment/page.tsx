'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getToken, isAuthenticated } from '@/lib/auth'
import { toast } from 'sonner'
import { CreditCard, Smartphone, AlertTriangle, CheckCircle } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface OrderInfo {
  id: string
  plan: string
  amount: number
  amountYuan: string
  planName: string
  status: string
  paid_at?: number
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState<OrderInfo | null>(null)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (!orderId) {
      router.replace('/pricing')
      return
    }

    const token = getToken()
    if (!token) {
      router.replace('/login?redirect=/payment')
      return
    }

    fetch(`${API_BASE}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setOrder(data)
        if (data.status === 'paid') {
          toast.success('订单已完成')
          router.replace('/profile')
        }
      })
      .catch(err => {
        toast.error(err.message || '获取订单失败')
        router.replace('/pricing')
      })
  }, [orderId, router])

  const handleMockPay = async () => {
    if (!orderId) return
    const token = getToken()
    if (!token) return

    setPaying(true)
    try {
      const res = await fetch(`${API_BASE}/payment/mock-pay/${orderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success('支付成功！Pro 功能已解锁')
      router.replace('/profile')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '支付失败'
      toast.error(message)
    } finally {
      setPaying(false)
    }
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4 border-b border-gray-200">
        <button type="button" onClick={() => router.back()} className="mb-4 text-sm text-gray-500 hover:text-gray-900">
          返回
        </button>
        <h1 className="text-xl font-bold text-gray-900">确认支付</h1>
      </div>

      {/* Order Info */}
      <div className="px-5 mt-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">套餐</span>
            <span className="font-medium text-gray-900 text-sm">{order.planName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">订单号</span>
            <span className="text-xs text-gray-400 font-mono">{order.id}</span>
          </div>
          <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
            <span className="text-gray-500 text-sm">应付金额</span>
            <div>
              <span className="text-3xl font-bold text-gray-900">&yen;{order.amountYuan}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">支付方式</h2>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Smartphone size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">微信支付</div>
              <div className="text-xs text-gray-400">推荐使用</div>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-gray-900 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-gray-900" />
            </div>
          </div>

          {/* QR Code placeholder */}
          <div className="p-6 text-center border-t border-gray-100">
            <div className="w-48 h-48 bg-gray-50 rounded-xl mx-auto flex items-center justify-center mb-4 border border-gray-200">
              <div className="text-center text-gray-400">
                <Smartphone size={32} className="mx-auto mb-2" />
                <div className="text-sm">微信扫码支付</div>
                <div className="text-xs mt-1">请使用微信扫描二维码</div>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              打开微信 &rarr; 扫一扫 &rarr; 扫描上方二维码
            </p>
          </div>
        </div>
      </div>

      {/* Mock Pay (Development) */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="px-5 mt-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 mb-2">
              <AlertTriangle size={16} />
              开发模式
            </div>
            <p className="text-xs text-yellow-700 mb-3">
              生产环境将接入真实微信支付，此处为模拟支付流程。
            </p>
            <button
              type="button"
              onClick={handleMockPay}
              disabled={paying}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {paying ? '处理中...' : (
                <>
                  <CheckCircle size={16} />
                  模拟支付（开发用）
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}

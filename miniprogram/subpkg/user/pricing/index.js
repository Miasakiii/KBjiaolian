// subpkg/user/pricing/index.js
// 定价页 — 展示套餐对比，引导用户升级
const { request } = require('../../../utils/request');
const app = getApp();

Page({
  data: {
    selectedPlan: 'pro_monthly',
    paying: false,
    user: {},
    plans: {
      free: {
        name: '免费版',
        price: '0',
        period: '',
        features: [
          '每日 2 次体态分析',
          '每日 1 次训练方案',
          '每日 2 次饮食识别',
          '每日 5 次 AI 对话',
        ],
      },
      pro_monthly: {
        name: 'Pro 月付',
        price: '29.90',
        period: '/月',
        badge: '热门',
        features: [
          '每日 25 次体态分析',
          '每日 10 次训练方案',
          '每日 25 次饮食识别',
          '每日 100 次 AI 对话',
          '渐进式超负荷训练',
          '前后对比分析',
          '数据导出',
        ],
      },
      pro_yearly: {
        name: 'Pro 年付',
        price: '168.00',
        period: '/年',
        badge: '省53%',
        features: [
          '每日 25 次体态分析',
          '每日 10 次训练方案',
          '每日 25 次饮食识别',
          '每日 100 次 AI 对话',
          '渐进式超负荷训练',
          '前后对比分析',
          '数据导出',
        ],
      },
    },
  },

  onLoad() {
    const user = wx.getStorageSync('user') || {};
    this.setData({ user });
  },

  // 选择套餐
  onSelectPlan(e) {
    const plan = e.currentTarget.dataset.plan;
    if (plan === 'free') return; // 免费版无需选择
    this.setData({ selectedPlan: plan });
  },

  // 确认购买 → 跳转支付页
  onConfirmPlan() {
    if (this.data.selectedPlan === 'free') {
      wx.showToast({ title: '你当前已是 Free 方案', icon: 'none' });
      return;
    }

    // 检查登录状态
    if (!app.globalData.isLoggedIn) {
      wx.navigateTo({ url: '/subpkg/user/login/index' });
      return;
    }

    // 跳转支付页
    wx.navigateTo({
      url: `/subpkg/user/payment/index?plan=${this.data.selectedPlan}`,
    });
  },
});

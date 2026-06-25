// pages/index/index.js - 首页逻辑
const { checkLogin } = require('../../utils/auth');
const { request } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    user: null,
    // 功能介绍（未登录态）
    features: [
      { key: 'analyze', icon: '/assets/icons/tab-analyze.svg', name: '体态分析', desc: 'AI 8维度评估' },
      { key: 'plan', icon: '/assets/icons/tab-plan.svg', name: '训练方案', desc: '个性化计划' },
      { key: 'chat', icon: '/assets/icons/tab-chat.svg', name: 'AI 对话', desc: '健身问答' },
      { key: 'nutrition', icon: '/assets/icons/pat-breathing.svg', name: '营养识别', desc: '拍照识食物' },
    ],
    // 快捷操作图标
    quickActions: [
      { key: 'analyze', icon: '/assets/icons/tab-analyze.svg', text: '体态分析' },
      { key: 'plan', icon: '/assets/icons/tab-plan.svg', text: '训练方案' },
      { key: 'chat', icon: '/assets/icons/tab-chat.svg', text: 'AI 对话' },
      { key: 'exercises', icon: '/assets/icons/tab-exercises.svg', text: '动作库' },
    ],
    today: '',
    // 配额数据
    quotaList: [
      { key: 'analyze', label: '体态分析', remaining: 0, total: 3, percent: 0 },
      { key: 'plan', label: '训练方案', remaining: 0, total: 3, percent: 0 },
      { key: 'chat', label: 'AI 对话', remaining: 0, total: 10, percent: 0 },
      { key: 'nutrition', label: '营养识别', remaining: 0, total: 3, percent: 0 },
    ],
    todaySummary: [],
  },

  onLoad() {
    // 设置今日日期
    const now = new Date();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const today = `${now.getMonth() + 1}月${now.getDate()}日 周${weekDays[now.getDay()]}`;
    this.setData({ today });
    this.checkLoginState();
  },

  onShow() {
    // 每次显示时刷新配额（从其他页面返回后可能已升级）
    if (app.globalData.isLoggedIn) {
      this.loadQuota();
    }
  },

  // 检查登录态
  checkLoginState() {
    const isLoggedIn = app.globalData.isLoggedIn;
    if (isLoggedIn) {
      const user = app.globalData.user;
      this.setData({ isLoggedIn: true, user });
      this.loadQuota();
    } else {
      this.setData({ isLoggedIn: false, user: null });
    }
  },

  // 加载今日配额
  async loadQuota() {
    try {
      const res = await request({ url: '/quota', method: 'GET' });
      // request() 直接返回 HTTP response body，即 { quotas, plan }
      const { quotas, plan } = res;
      const quotaList = [
        { key: 'analyze', label: '体态分析', remaining: quotas.analyze?.remaining ?? 0, total: quotas.analyze?.total ?? 3, percent: 0 },
        { key: 'plan', label: '训练方案', remaining: quotas.plan?.remaining ?? 0, total: quotas.plan?.total ?? 3, percent: 0 },
        { key: 'chat', label: 'AI 对话', remaining: quotas.chat?.remaining ?? 0, total: quotas.chat?.total ?? 10, percent: 0 },
        { key: 'nutrition', label: '营养识别', remaining: quotas.nutrition?.remaining ?? 0, total: quotas.nutrition?.total ?? 3, percent: 0 },
      ];
      quotaList.forEach(item => {
        item.percent = item.total > 0 ? Math.min(100, (item.remaining / item.total) * 100) : 0;
      });
      this.setData({ quotaList, 'user.plan': plan });
    } catch (err) {
      console.error('[index] loadQuota failed', err);
    }
  },

  // 点击登录
  onTapLogin() {
    wx.navigateTo({ url: '/subpkg/user/login/index' });
  },

  // 快捷操作跳转（统一入口）
  onTapQuick(e) {
    const key = e.currentTarget.dataset.key;
    if (!this.checkAuth()) return;
    const map = { analyze: '/pages/analyze/index', plan: '/pages/plan/index', chat: '/pages/chat/index', exercises: '/pages/exercises/index' };
    wx.switchTab({ url: map[key] });
  },
  // 空态 CTA 跳转分析
  onTapAnalyze() {
    if (!this.checkAuth()) return;
    wx.switchTab({ url: '/pages/analyze/index' });
  },

  // 升级 Pro
  onTapUpgrade() {
    wx.navigateTo({ url: '/subpkg/user/pricing/index' });
  },

  // 登录检查
  checkAuth() {
    if (!app.globalData.isLoggedIn) {
      wx.navigateTo({ url: '/subpkg/user/login/index' });
      return false;
    }
    return true;
  },

  // 分享配置
  onShareAppMessage() {
    return {
      title: 'KB教练 - AI 体态评估与训练专家',
      path: '/pages/index/index',
    };
  },
});

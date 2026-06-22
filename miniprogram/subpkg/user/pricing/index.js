// subpkg/user/pricing/index.js
const { request } = require('../../../utils/request');
const app = getApp();

Page({
  data: { selectedPlan: 'pro', paying: false, user: {} },
  onLoad() {
    const user = wx.getStorageSync('user') || {};
    this.setData({ user, selectedPlan: user.plan === 'pro' ? 'pro' : 'free' });
  },

  onSelectPlan(e) {
    this.setData({ selectedPlan: e.currentTarget.dataset.plan });
  },

  async onConfirmPlan() {
    if (this.data.selectedPlan === 'free') {
      wx.showToast({ title: '你当前已是 Free 方案', icon: 'none' });
      return;
    }
    // 跳转支付页
    wx.navigateTo({ url: `/subpkg/user/payment/index?plan=pro` });
  },
});

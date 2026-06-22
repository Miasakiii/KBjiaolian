// subpkg/user/profile/index.js
const { logout } = require('../../../utils/auth');
const { request } = require('../../../utils/request');

Page({
  data: { user: {} },
  onLoad() { this.loadUser(); },
  onShow() { this.loadUser(); },

  async loadUser() {
    const user = wx.getStorageSync('user');
    if (user) this.setData({ user });
    try {
      const res = await request({ url: '/auth/profile', method: 'GET' });
      this.setData({ user: res });
      wx.setStorageSync('user', res);
    } catch (e) {}
  },

  onTapPricing() { wx.navigateTo({ url: '/subpkg/user/pricing/index' }); },
  onTapHistory() { wx.navigateTo({ url: '/subpkg/history/analysis/index' }); },
  onTapAbout() { wx.navigateTo({ url: '/subpkg/user/about/index' }); },
  onTapLogout() {
    wx.showModal({
      title: '确认退出', content: '确定要退出登录吗？',
      success: (res) => { if (res.confirm) logout(); },
    });
  },
});

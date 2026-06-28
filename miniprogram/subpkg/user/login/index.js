// subpkg/user/login/index.js - 登录页逻辑
const { login } = require('../../../utils/auth');
const { request } = require('../../../utils/request');

Page({
  data: { email: '', password: '' },
  onLoad() {},

  // 微信一键登录
  async onWxLogin() {
    try {
      await login();
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 800);
    } catch (err) {
      console.error('[login] wx login failed', err);
    }
  },

  onEmailInput(e) { this.setData({ email: e.detail.value }); },
  onPwdInput(e) { this.setData({ password: e.detail.value }); },

  // 跳转用户协议
  onViewAgreement() {
    wx.navigateTo({ url: '/subpkg/user/agreement/index' });
  },

  // 跳转隐私政策
  onViewPrivacy() {
    wx.navigateTo({ url: '/subpkg/user/privacy/index' });
  },

  async onEmailLogin() {
    const { email, password } = this.data;
    if (!email || !password) { wx.showToast({ title: '请输入邮箱和密码', icon: 'none' }); return; }
    try {
        const res = await request({ url: '/auth/login', method: 'POST', data: { email, password } });
        wx.setStorageSync('token', res.access_token);
        wx.setStorageSync('user', res.user);
      getApp().globalData.isLoggedIn = true;
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 800);
    } catch (err) { /* error shown by request.js */ }
  },
});

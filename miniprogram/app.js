// app.js - KB教练小程序 App 生命周期 + 全局状态
const { checkLogin } = require('./utils/auth');

App({
  globalData: {
    // 用户信息（登录后填充）
    user: null,
    isLoggedIn: false,
    token: '',

    // API 基础地址
    // 本地开发：http://localhost:3003/api（🚀 端口需与 backend/.env 的 PORT 一致）
    // 生产环境：https://kb.wctgrzpj.cn/api
    apiBase: 'http://localhost:3003/api',

    // 品牌色（与 Web 端保持一致）
    themeColor: '#22c55e',
    themeColorLight: '#dcfce7',
  },

  onLaunch(options) {
    console.log('[App] onLaunch', options);
    // 读取本地缓存的 token
    const token = wx.getStorageSync('token');
    const user = wx.getStorageSync('user');
    if (token && user) {
      this.globalData.token = token;
      this.globalData.user = user;
      this.globalData.isLoggedIn = true;
    }
  },

  onShow(options) {
    console.log('[App] onShow', options);
  },

  onHide() {
    console.log('[App] onHide');
  },

  // 全局登录方法（页面可直接调用）
  async login() {
    const { login } = require('./utils/auth');
    try {
      const user = await login();
      this.globalData.user = user;
      this.globalData.isLoggedIn = true;
      this.globalData.token = wx.getStorageSync('token');
      return user;
    } catch (err) {
      console.error('[App] login failed', err);
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      throw err;
    }
  },

  // 检查登录态，未登录则跳转登录页
  async ensureLogin() {
    if (this.globalData.isLoggedIn) return true;
    try {
      await this.login();
      return true;
    } catch (err) {
      // 跳转分包登录页
      wx.navigateTo({ url: '/subpkg/user/login/index' });
      return false;
    }
  },
});

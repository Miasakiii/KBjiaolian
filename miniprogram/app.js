// app.js - KB教练小程序 App 生命周期 + 全局状态
const { checkLogin } = require('./utils/auth');

App({
  globalData: {
    // 用户信息（登录后填充）
    user: null,
    isLoggedIn: false,
    token: '',

    // API 基础地址
    // 自动按运行环境切换：develop/trial → 本地，release → 生产
    // 本地开发如需切换端口，改这里即可（🚀 端口需与 backend/.env 的 PORT 一致）
    apiBase: (() => {
      try {
        const env = wx.getAccountInfoSync().miniProgram.envVersion;
        // release = 正式版, trial = 体验版, develop = 开发版
        return env === 'release'
          ? 'https://kb.wctgrzpj.cn/api'
          : 'http://localhost:3003/api';
      } catch (e) {
        // 兜底：默认生产域名，避免本地配置遗漏导致线上白屏
        return 'https://kb.wctgrzpj.cn/api';
      }
    })(),

    // 训练偏好（设置页可修改，与 Flutter 端默认值保持一致）
    equipment: 'bodyweight',       // bodyweight | dumbbell | gym
    daysPerWeek: 4,                // 3~6
    sessionDuration: 60,           // 分钟

    // 品牌色（与 Web 端保持一致）
    themeColor: '#0f766e',
    themeColorLight: '#ccfbf1',
  },

  onLaunch(options) {
    // 版本更新检查（发版后自动拉取新版本并重启）
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.info('[App] 检测到新版本，开始下载...');
        }
      });
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已就绪，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          },
        });
      });
      updateManager.onUpdateFailed(() => {
        wx.showToast({ title: '新版本下载失败，请检查网络', icon: 'none' });
      });
    }

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
    // 静默处理，不再打印敏感的启动参数
  },

  onHide() {
    // 静默处理
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

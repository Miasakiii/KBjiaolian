// utils/auth.js - 微信登录流程 + token 管理
const { request } = require('./request');

/**
 * 获取 app 实例（懒加载，避免 require 时 App 未初始化）
 */
const getAppSafe = () => {
  try { return getApp(); } catch (e) { return null; }
};

/**
 * 微信一键登录（wx.login → 后端换 token）
 * 需要在后端新增 POST /api/auth/wechat-login 端点
 * @returns {Promise<user>}
 */
const login = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: ({ code }) => {
        if (!code) {
          wx.showToast({ title: '获取登录凭证失败', icon: 'none' });
          return reject(new Error('no login code'));
        }
        // 调用后端微信登录端点
        request({
          url: '/auth/wechat-login',
          method: 'POST',
          data: { code },
          skipAuth: true, // 不需要 token
        }).then(res => {
          // request() 已返回 HTTP response body，即 { access_token, user }
          const { access_token, user } = res;
          // 存到本地 + 全局
          wx.setStorageSync('token', access_token);
          wx.setStorageSync('user', user);
          const app = getAppSafe();
          if (app) {
            app.globalData.token = access_token;
            app.globalData.user = user;
            app.globalData.isLoggedIn = true;
          }
          resolve(user);
        }).catch(err => {
          console.error('[auth] wechat-login failed', err);
          wx.showToast({ title: '登录失败，请重试', icon: 'none' });
          reject(err);
        });
      },
      fail: (err) => {
        console.error('[auth] wx.login failed', err);
        wx.showToast({ title: '微信登录失败', icon: 'none' });
        reject(err);
      },
    });
  });
};

/**
 * 检查本地 token 是否有效（调轻量接口验证）
 * @returns {Promise<boolean>}
 */
const checkLogin = async () => {
  const token = wx.getStorageSync('token');
  if (!token) return false;
  try {
    const res = await request({ url: '/auth/profile', method: 'GET' });
    const app = getAppSafe();
    if (app) {
      app.globalData.isLoggedIn = true;
      app.globalData.token = token;
      app.globalData.user = res; // GET /auth/profile 返回 { id, nickname, plan }
    }
    wx.setStorageSync('user', res);
    return true;
  } catch (err) {
    // token 失效，清除
    wx.removeStorageSync('token');
    wx.removeStorageSync('user');
    const app = getAppSafe();
    if (app) {
      app.globalData.isLoggedIn = false;
      app.globalData.token = '';
      app.globalData.user = null;
    }
    return false;
  }
};

/**
 * 退出登录
 */
const logout = () => {
  wx.removeStorageSync('token');
  wx.removeStorageSync('user');
  const app = getAppSafe();
  if (app) {
    app.globalData.isLoggedIn = false;
    app.globalData.token = '';
    app.globalData.user = null;
  }
  wx.showToast({ title: '已退出登录', icon: 'none' });
  wx.reLaunch({ url: '/pages/index/index' });
};

/**
 * 确保登录态（未登录则跳转登录页）
 * @returns {Promise<boolean>}
 */
const ensureLogin = async (showLoginPage = true) => {
  const valid = await checkLogin();
  if (valid) return true;
  if (showLoginPage) {
    wx.navigateTo({ url: '/subpkg/user/login/index' });
  }
  return false;
};

module.exports = { login, checkLogin, logout, ensureLogin };

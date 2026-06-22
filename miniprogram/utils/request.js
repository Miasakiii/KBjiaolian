// utils/request.js - 统一 API 请求封装（Bearer JWT + 401 自动刷新）
// 注意：不在模块顶层调用 getApp()，改为在函数内懒加载，避免 require 时 App 未初始化

const getApiBase = () => {
  // 优先读全局变量，fallback 到本地存储（防止 app.js 未就绪）
  try {
    const app = getApp();
    if (app && app.globalData && app.globalData.apiBase) {
      return app.globalData.apiBase;
    }
  } catch (e) { /* ignore */ }
  // fallback: 从存储读取（app.js 的 onLaunch 会写入）
  return 'https://kb.wctgrzpj.cn/api';
};

/**
 * 统一请求方法
 * @param {Object} options - { url, method, data, skipAuth, header }
 * @returns {Promise}
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    const BASE_URL = getApiBase();
    const token = wx.getStorageSync('token');
    const header = {
      'Content-Type': 'application/json',
      ...(token && !options.skipAuth ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.header || {}),
    };

    wx.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      success: (res) => {
        if (res.statusCode === 401 && !options.skipAuth) {
          // Token 过期，清除本地存储，跳转登录
          wx.removeStorageSync('token');
          wx.removeStorageSync('user');
          try {
            const app = getApp();
            if (app) app.globalData.isLoggedIn = false;
          } catch (e) { /* ignore */ }
          wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
          wx.navigateTo({ url: '/subpkg/user/login/index' });
          return reject({ code: 401, message: '登录已过期' });
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          const msg = (res.data && res.data.message) || `请求失败(${res.statusCode})`;
          wx.showToast({ title: msg, icon: 'none' });
          reject({ code: res.statusCode, message: msg, data: res.data });
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络异常，请检查网络', icon: 'none' });
        reject({ code: -1, message: '网络异常', detail: err });
      },
    });
  });
};

/**
 * 文件上传（用于体态分析图片）
 * @param {string} filePath - 本地临时文件路径
 * @param {string} apiUrl - API 路径，如 '/api/analyze'
 * @returns {Promise}
 */
const uploadFile = (filePath, apiUrl) => {
  return new Promise((resolve, reject) => {
    const BASE_URL = getApiBase();
    const token = wx.getStorageSync('token');
    wx.uploadFile({
      url: `${BASE_URL}${apiUrl}`,
      filePath,
      name: 'image',
      header: token ? { 'Authorization': `Bearer ${token}` } : {},
      success: (res) => {
        let data;
        try { data = JSON.parse(res.data); } catch (e) { data = res.data || {}; }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          const msg = (data && data.message) || '上传失败';
          wx.showToast({ title: msg, icon: 'none' });
          reject(data);
        }
      },
      fail: (err) => {
        wx.showToast({ title: '上传失败，请重试', icon: 'none' });
        reject(err);
      },
    });
  });
};

module.exports = { request, uploadFile };

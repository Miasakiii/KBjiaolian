// pages/analyze/index.js - 体态分析页逻辑
const { checkLogin } = require('../../utils/auth');
const { request, uploadFile } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    step: 'idle',        // idle | uploading | analyzing | result
    resultImageUrl: '',
    result: null,
    hasHistory: false,
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    if (app.globalData.isLoggedIn) {
      this.setData({ isLoggedIn: true });
      this.checkHistory();
    }
  },

  checkLogin() {
    if (app.globalData.isLoggedIn) {
      this.setData({ isLoggedIn: true });
      this.checkHistory();
    }
  },

  async checkHistory() {
    try {
      // 列表接口返回 { data: [...] }，res.data 才是数组
      const res = await request({ url: '/data/analysis?limit=1', method: 'GET' });
      this.setData({ hasHistory: res.data && res.data.length > 0 });
    } catch (e) { /* ignore */ }
  },

  // 拍照
  onChooseCamera() {
    this.chooseMedia('camera');
  },

  // 从相册选择
  onChooseAlbum() {
    this.chooseMedia('album');
  },

  chooseMedia(sourceType) {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: [sourceType],
      sizeType: ['compressed'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.compressAndUpload(tempFilePath);
      },
      fail: (err) => {
        if (!err.errMsg.includes('cancel')) {
          wx.showToast({ title: '选择图片失败', icon: 'none' });
        }
      },
    });
  },

  // 压缩 + 上传（小程序用 base64 方式，与 Web 端保持一致）
  async compressAndUpload(filePath) {
    try {
      // 压缩图片
      const compressRes = await new Promise((resolve, reject) => {
        wx.compressImage({
          src: filePath,
          quality: 70,
          success: resolve,
          fail: () => resolve({ tempFilePath: filePath }),
        });
      });

      this.setData({ step: 'uploading' });

      // 转 base64（小程序不支持直接传 base64，需要读文件）
      const base64 = await this.fileToBase64(compressRes.tempFilePath || filePath);

      this.setData({ step: 'analyzing' });

      // 直接调用分析接口（后端同步返回结果）
      const result = await request({
        url: '/analyze',
        method: 'POST',
        data: { image: base64 },
      });

      // request() 返回 HTTP response body，即分析结果对象
      this.showResult(result);
    } catch (err) {
      console.error('[analyze] upload failed', err);
      wx.showToast({ title: '分析失败，请重试', icon: 'none' });
      this.setData({ step: 'idle' });
    }
  },

  // 小程序本地文件转 base64
  fileToBase64(filePath) {
    return new Promise((resolve, reject) => {
      const fs = wx.getFileSystemManager();
      fs.readFile({
        filePath,
        encoding: 'base64',
        success: (res) => {
          // 拼成 data URI 格式，与 Web 端保持一致
          const ext = filePath.split('.').pop().toLowerCase();
          const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
          resolve(`data:${mime};base64,${res.data}`);
        },
        fail: (err) => {
          reject(err);
        },
      });
    });
  },

  // 展示结果
  showResult(resultData) {
    this.setData({
      step: 'result',
      result: resultData,
      resultImageUrl: resultData.imageUrl || '',
    });
  },

  // 保存记录
  async onTapSave() {
    try {
      await request({
        url: '/data/analysis',
        method: 'POST',
        data: { analysisId: this.data.result.id },
      });
      wx.showToast({ title: '已保存', icon: 'success' });
      this.checkHistory();
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  // 重新拍照
  onTapRetake() {
    this.setData({ step: 'idle', result: null });
  },

  // 前后对比
  onTapCompare() {
    wx.navigateTo({ url: '/subpkg/history/compare/index' });
  },

  onTapLogin() {
    wx.navigateTo({ url: '/subpkg/user/login/index' });
  },

  onShareAppMessage() {
    return {
      title: `我的体态评分 ${this.data.result?.overallScore || '--'} 分`,
      path: '/pages/index/index',
    };
  },
});

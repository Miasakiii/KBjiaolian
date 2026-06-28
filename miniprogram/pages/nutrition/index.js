// pages/nutrition/index.js - 营养识别页逻辑
const { checkLogin } = require('../../utils/auth');
const { request } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    mealType: 'lunch',
    mealTypes: [
      { key: 'breakfast', label: '早餐' },
      { key: 'lunch', label: '午餐' },
      { key: 'dinner', label: '晚餐' },
      { key: 'snack', label: '加餐' },
    ],
    step: 'idle',        // idle | uploading | analyzing | result
    imagePreview: '',
    result: null,
    todayNutrition: null,
  },

  onLoad() {
    if (app.globalData.isLoggedIn) {
      this.setData({ isLoggedIn: true });
    }
  },

  onShow() {
    if (app.globalData.isLoggedIn) {
      this.setData({ isLoggedIn: true });
      this.loadTodayNutrition();
    }
  },

  // 选择餐次
  onSelectMeal(e) {
    this.setData({ mealType: e.currentTarget.dataset.key });
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
        this.setData({ imagePreview: tempFilePath });
        this.compressAndAnalyze(tempFilePath);
      },
      fail: (err) => {
        if (!err.errMsg.includes('cancel')) {
          wx.showToast({ title: '选择图片失败', icon: 'none' });
        }
      },
    });
  },

  // 压缩 + 分析
  async compressAndAnalyze(filePath) {
    try {
      const compressRes = await new Promise((resolve, reject) => {
        wx.compressImage({
          src: filePath,
          quality: 85,
          success: resolve,
          fail: () => resolve({ tempFilePath: filePath }),
        });
      });

      this.setData({ step: 'uploading' });

      const base64 = await this.fileToBase64(compressRes.tempFilePath || filePath);

      this.setData({ step: 'analyzing' });

      const result = await request({
        url: '/nutrition/analyze',
        method: 'POST',
        data: { image: base64 },
      });

      this.setData({ step: 'result', result });
      this.saveRecord(result);
      this.loadTodayNutrition();
    } catch (err) {
      console.error('[nutrition] analyze failed', err);
      wx.showToast({ title: '识别失败，请重试', icon: 'none' });
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
          const ext = filePath.split('.').pop().toLowerCase();
          const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
          resolve(`data:${mime};base64,${res.data}`);
        },
        fail: (err) => reject(err),
      });
    });
  },

  // 保存记录
  async saveRecord(result) {
    try {
      await request({
        url: '/data/nutrition',
        method: 'POST',
        data: {
          meal_type: this.data.mealType,
          image_preview: this.data.imagePreview,
          foods: result.foods,
          total_calories: result.totalCalories,
          total_protein: result.totalProtein,
          total_carbs: result.totalCarbs,
          total_fat: result.totalFat,
          tips: result.tips,
        },
      });
    } catch (e) {
      console.error('[nutrition] save failed', e);
    }
  },

  // 加载今日营养汇总
  async loadTodayNutrition() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const res = await request({ url: '/data/nutrition', method: 'GET' });
      const records = res.data || res || [];
      const todayRecords = (Array.isArray(records) ? records : []).filter(r => {
        return r.created_at && r.created_at >= today.getTime();
      });

      if (todayRecords.length === 0) {
        this.setData({ todayNutrition: null });
        return;
      }

      let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
      todayRecords.forEach(r => {
        totalCalories += r.total_calories || 0;
        totalProtein += r.total_protein || 0;
        totalCarbs += r.total_carbs || 0;
        totalFat += r.total_fat || 0;
      });

      this.setData({
        todayNutrition: {
          calories: Math.round(totalCalories),
          protein: Math.round(totalProtein),
          carbs: Math.round(totalCarbs),
          fat: Math.round(totalFat),
          count: todayRecords.length,
        },
      });
    } catch (e) {
      console.error('[nutrition] loadToday failed', e);
    }
  },

  // 重新拍照
  onTapRetake() {
    this.setData({ step: 'idle', result: null, imagePreview: '' });
  },

  onTapLogin() {
    wx.navigateTo({ url: '/subpkg/user/login/index' });
  },

  onShareAppMessage() {
    return {
      title: 'AI 营养识别 - KB教练',
      path: '/pages/index/index',
    };
  },
});

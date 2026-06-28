// pages/plan/index.js - 训练方案页逻辑
const { request } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    goal: 'general',
    goalOptions: [
      { key: 'general', label: '综合健身' },
      { key: 'weight_loss', label: '减脂' },
      { key: 'muscle_gain', label: '增肌' },
      { key: 'rehab', label: '康复矫正' },
      { key: 'endurance', label: '耐力' },
    ],
    selectedParts: [],
    selectedPartMap: {},
    partOptions: ['胸部', '背部', '肩部', '手臂', '核心', '腿部', '全身'],
    level: 'intermediate',
    levelOptions: [
      { key: 'beginner', label: '初学者' },
      { key: 'intermediate', label: '中级' },
      { key: 'advanced', label: '高级' },
    ],
    analysisResult: null,
    generating: false,
    planData: null,
    expandedDay: -1,
    // 渐进式超负荷
    loadingProgression: false,
    progressionSuggestions: [],
    progressionExerciseCount: 0,
    progressionTotalSessions: 0,
    showProgression: false,
  },

  onLoad() {
    this.checkLogin();
    this._loadLatestAnalysis();
  },
  onShow() {
    if (app.globalData.isLoggedIn) {
      this.setData({ isLoggedIn: true });
      // 每次进入页面自动尝试加载渐进式建议
      this._autoLoadProgression();
    }
  },

  // 从 app.globalData 获取训练偏好（设置页修改后自动生效）
  _getTrainingPrefs() {
    return {
      equipment: app.globalData.equipment || 'bodyweight',
      daysPerWeek: app.globalData.daysPerWeek || 4,
      sessionDuration: app.globalData.sessionDuration || 60,
    };
  },

  // 加载最新的体态分析结果（供渐进式方案生成使用）
  async _loadLatestAnalysis() {
    try {
      const res = await request({
        url: '/data/analysis?limit=1',
        method: 'GET',
      });
      // 带分页参数时返回 { data: [...], pagination: {...} }
      const records = res.data || res;
      if (Array.isArray(records) && records.length > 0 && records[0].result) {
        this.setData({ analysisResult: records[0].result });
      }
    } catch (err) {
      // 静默失败，生成时再提示用户
    }
  },

  // 自动加载渐进式建议（静默，无历史则不打扰）
  async _autoLoadProgression() {
    if (this.data.loadingProgression || this.data.showProgression) return;
    try {
      const res = await request({
        url: '/plan/progression?experience=' + this.data.level,
        method: 'GET',
      });
      if (res.exerciseCount > 0) {
        this.setData({
          progressionSuggestions: res.summary || [],
          progressionExerciseCount: res.exerciseCount || 0,
          progressionTotalSessions: res.totalSessions || 0,
          showProgression: true,
        });
      }
    } catch (err) {
      // 静默失败，不影响用户体验
    }
  },

  checkLogin() {
    if (!app.globalData.isLoggedIn) {
      this.setData({ isLoggedIn: false });
    } else {
      this.setData({ isLoggedIn: true });
    }
  },

  onSelectGoal(e) { this.setData({ goal: e.currentTarget.dataset.key }); },
  onSelectLevel(e) { this.setData({ level: e.currentTarget.dataset.key }); },
  onTogglePart(e) {
    const part = e.currentTarget.dataset.part;
    const arr = [...this.data.selectedParts];
    const map = { ...this.data.selectedPartMap };
    const idx = arr.indexOf(part);
    if (idx >= 0) { arr.splice(idx, 1); delete map[part]; }
    else if (arr.length < 3) { arr.push(part); map[part] = true; }
    this.setData({ selectedParts: arr, selectedPartMap: map });
  },

  // 生成方案
  async onGenerate() {
    if (this.data.generating) return;
    this.setData({ generating: true });
    try {
      const res = await request({
        url: '/plan/generate',
        method: 'POST',
        data: {
          goal: this.data.goal,
          level: this.data.level,
          bodyParts: this.data.selectedParts,
        },
      });
      this.setData({ planData: res, generating: false, expandedDay: 0 });
      wx.showToast({ title: '方案已生成', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: err.message || '生成失败', icon: 'none' });
      this.setData({ generating: false });
    }
  },

  // 展开/收起某天
  onToggleDay(e) {
    const idx = e.currentTarget.dataset.idx;
    this.setData({ expandedDay: this.data.expandedDay === idx ? -1 : idx });
  },

  // 保存方案
  async onSavePlan() {
    try {
      await request({
        url: '/data/plans',
        method: 'POST',
        data: { plan: this.data.planData },
      });
      wx.showToast({ title: '已保存', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  // 重新生成
  onRegenerate() {
    this.setData({ planData: null, expandedDay: -1 });
  },

  // 加载渐进式超负荷建议
  async onLoadProgression() {
    if (this.data.loadingProgression) return;
    this.setData({ loadingProgression: true, showProgression: false });
    try {
      const res = await request({
        url: '/plan/progression?experience=' + this.data.level,
        method: 'GET',
      });
      if (res.exerciseCount === 0) {
        this.setData({
          loadingProgression: false,
          progressionSuggestions: [],
          progressionExerciseCount: 0,
          showProgression: true,
        });
        wx.showToast({ title: '暂无训练历史，先生成方案开始训练吧', icon: 'none', duration: 2500 });
        return;
      }
      this.setData({
        loadingProgression: false,
        progressionSuggestions: res.summary || [],
        progressionExerciseCount: res.exerciseCount || 0,
        progressionTotalSessions: res.totalSessions || 0,
        showProgression: true,
      });
    } catch (err) {
      wx.showToast({ title: err.message || '获取建议失败', icon: 'none' });
      this.setData({ loadingProgression: false });
    }
  },

  // 关闭渐进式建议面板
  onCloseProgression() {
    this.setData({ showProgression: false, progressionSuggestions: [] });
  },

  // 基于渐进式建议生成方案
  async onProgressiveGenerate() {
    if (this.data.generating) return;

    // 检查是否有体态分析结果
    if (!this.data.analysisResult) {
      wx.showToast({ title: '请先进行体态分析', icon: 'none' });
      return;
    }

    this.setData({ generating: true });
    try {
      const prefs = this._getTrainingPrefs();
      const res = await request({
        url: '/plan/progressive',
        method: 'POST',
        data: {
          goal: this.data.goal,
          experience: this.data.level,
          equipment: prefs.equipment,
          daysPerWeek: prefs.daysPerWeek,
          sessionDuration: prefs.sessionDuration,
          analysisResult: this.data.analysisResult,
        },
      });
      this.setData({ planData: res, generating: false, expandedDay: 0 });
      wx.showToast({ title: '智能方案已生成', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: err.message || '生成失败', icon: 'none' });
      this.setData({ generating: false });
    }
  },

  // 分享给好友
  onShareAppMessage() {
    return {
      title: 'KB教练 - AI 定制你的训练方案',
      path: '/pages/plan/index',
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'KB教练 - AI 定制你的训练方案',
    };
  },

  // 引导用户分享到朋友圈
  onShareToMoments() {
    wx.showModal({
      title: '分享到朋友圈',
      content: '点击右上角「...」，选择「分享到朋友圈」即可',
      showCancel: false,
      confirmText: '我知道了',
    });
  },

  onTapLogin() {
    wx.navigateTo({ url: '/subpkg/user/login/index' });
  },
});

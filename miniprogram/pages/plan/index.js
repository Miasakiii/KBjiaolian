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
    generating: false,
    planData: null,
    expandedDay: -1,
  },

  onLoad() { this.checkLogin(); },
  onShow() { if (app.globalData.isLoggedIn) this.setData({ isLoggedIn: true }); },

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

  onTapLogin() {
    wx.navigateTo({ url: '/subpkg/user/login/index' });
  },
});

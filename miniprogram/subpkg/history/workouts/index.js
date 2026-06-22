// subpkg/history/workouts/index.js
const { request } = require('../../../utils/request');

Page({
  data: { list: [] },
  onLoad() { this.loadList(); },
  onShow() { this.loadList(); },

  async loadList() {
    try {
      const res = await request({ url: '/data/workouts?limit=50', method: 'GET' });
      const list = (res.data || []).map(item => ({
        ...item,
        dateStr: this.formatDate(item.createdAt),
      }));
      this.setData({ list });
    } catch (err) { /* error shown by request.js */ }
  },

  formatDate(ts) {
    const d = new Date(ts);
    return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
  },

  onTapWorkout(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/subpkg/history/workouts/detail/index?id=${id}` });
  },

  onGoPlan() { wx.switchTab({ url: '/pages/plan/index' }); },
});

// subpkg/history/analysis/index.js
const { request } = require('../../../utils/request');

Page({
  data: { list: [] },
  onLoad() { this.loadList(); },
  onShow() { this.loadList(); },

  async loadList() {
    try {
      const res = await request({ url: '/data/analysis?limit=50', method: 'GET' });
      const list = (res.data || []).map(item => ({
        ...item,
        dateStr: this.formatDate(item.createdAt),
        keyDims: (item.dimensions || []).slice(0, 3),
      }));
      this.setData({ list });
    } catch (err) { /* error shown by request.js */ }
  },

  formatDate(ts) {
    const d = new Date(ts);
    return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
  },

  onTapRecord(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/subpkg/history/analysis/detail/index?id=${id}` });
  },

  onTapCompare(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/subpkg/history/compare/index?preselect=${id}` });
  },

  onGoAnalyze() { wx.switchTab({ url: '/pages/analyze/index' }); },
});

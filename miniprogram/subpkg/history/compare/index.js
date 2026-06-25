// subpkg/history/compare/index.js
const { request } = require('../../../utils/request');

Page({
  data: {
    list: [],
    selected: [],
    loading: false,
    compareResult: null,
  },

  onLoad(options) {
    this.loadList();
    if (options.preselect) {
      // 从分析历史页跳转过来，预选一条
      this.setData({ preselectId: options.preselect });
    }
  },

  onShow() { this.loadList(); },

  async loadList() {
    try {
      const res = await request({ url: '/data/analysis?limit=50', method: 'GET' });
      const list = (res.data || []).map(item => ({
        ...item,
        dateStr: this.formatDate(item.createdAt),
        selected: false,
      }));
      this.setData({ list });
      // 处理预选
      if (this.data.preselectId) {
        const idx = list.findIndex(i => i.id === this.data.preselectId);
        if (idx >= 0) {
          this.toggleSelectById(this.data.preselectId);
          this.setData({ preselectId: null });
        }
      }
    } catch (err) {}
  },

  formatDate(ts) {
    const d = new Date(ts);
    return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
  },

  onToggleSelect(e) {
    const id = e.currentTarget.dataset.id;
    const selected = [...this.data.selected];
    const existIdx = selected.findIndex(s => s.id === id);
    if (existIdx >= 0) {
      selected.splice(existIdx, 1);
    } else if (selected.length < 2) {
      const item = this.data.list.find(l => l.id === id);
      if (item) selected.push(item);
    } else {
      wx.showToast({ title: '最多选择 2 条', icon: 'none' });
      return;
    }
    this.updateListSelection(selected);
    this.setData({ selected, compareResult: null });
  },

  onRemove(e) {
    const idx = e.currentTarget.dataset.idx;
    const selected = [...this.data.selected];
    selected.splice(idx, 1);
    this.updateListSelection(selected);
    this.setData({ selected, compareResult: null });
  },

  updateListSelection(selectedIds) {
    const ids = selectedIds.map(s => typeof s === 'string' ? s : s.id);
    this.setData({
      list: this.data.list.map(item => ({
        ...item, selected: ids.includes(item.id)
      }))
    });
  },

  async onCompare() {
    if (this.data.selected.length < 2 || this.data.loading) return;
    this.setData({ loading: true });
    try {
      const res = await request({
        url: '/analyze/compare',
        method: 'POST',
        data: {
          recordA: this.data.selected[0].id,
          recordB: this.data.selected[1].id,
        },
      });
      // 标准化对比结果：构造雷达对象 + 维度图标 key
      const iconMap = { '头前伸':'headforward','圆肩':'roundshoulder','骨盆前倾':'pelvictilt','膝超伸':'kneeextension','脊柱侧弯':'spinal','高低肩':'shoulderheight','XO型腿':'leg','核心稳定':'core' };
      if (res.dims) {
        res.dims = res.dims.map(d => ({ ...d, iconKey: iconMap[d.name] || 'core' }));
        // 若后端未返回 radarA/radarB，从 dims 的 before/after 构造
        if (!res.radarA || !res.radarB) {
          const keys = ['headForward','roundShoulder','pelvicTilt','kneeExtension','spinalCurvature','shoulderHeight','legAlignment','coreStability'];
          const toRadar = (field) => { const o = {}; res.dims.forEach((d, i) => { o[keys[i]] = d[field] ?? 0; }); return o; };
          if (!res.radarA) res.radarA = toRadar('before');
          if (!res.radarB) res.radarB = toRadar('after');
        }
      }
      this.setData({ compareResult: res, loading: false });
    } catch (err) {
      this.setData({ loading: false });
    }
  },
});

// subpkg/history/progress/index.js - 进度趋势页
const { request } = require('../../../utils/request');

const DIM_LABELS = {
  headForward: '头前伸',
  roundShoulder: '圆肩',
  pelvicTilt: '骨盆前倾',
  kneeExtension: '膝超伸',
  spinalCurvature: '脊柱侧弯',
  shoulderHeight: '高低肩',
  legAlignment: 'XO型腿',
  coreStability: '核心稳定',
};

Page({
  data: {
    loading: true,
    hasData: false,
    list: [],
    maxScore: 0,
    minScore: 0,
    avgScore: '0',
  },

  onLoad() { this.loadData(); },
  onShow() { this.loadData(); },

  async loadData() {
    this.setData({ loading: true });
    try {
      const res = await request({ url: '/data/analysis?limit=50', method: 'GET' });
      // 兼容分页和非分页响应
      const raw = Array.isArray(res) ? res : (res.data || []);

      // 提取有效记录（按时间正序，用于趋势图）
      const records = raw
        .filter(item => {
          const score = item.result ? item.result.score : item.overallScore;
          return score != null;
        })
        .map(item => {
          const score = item.result ? item.result.score : item.overallScore;
          const radar = item.result ? item.result.radar : {};
          const ts = item.timestamp || item.createdAt;
          return {
            id: item.id,
            score: score,
            radar: radar || {},
            dateStr: this.formatDate(ts),
            dimLabels: this.getDimLabels(radar),
          };
        })
        .reverse(); // 时间正序

      if (records.length === 0) {
        this.setData({ loading: false, hasData: false, list: [] });
        return;
      }

      const scores = records.map(r => r.score);
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

      // 趋势图需要时间正序
      this._records = records.slice();
      this._scores = scores;

      this.setData({
        loading: false,
        hasData: true,
        list: records.reverse(), // 列表按时间倒序
        maxScore,
        minScore,
        avgScore,
      });

      this.drawChart();
    } catch (err) {
      this.setData({ loading: false, hasData: false });
    }
  },

  formatDate(ts) {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  },

  getDimLabels(radar) {
    if (!radar || typeof radar !== 'object') return [];
    const labels = [];
    Object.keys(radar).forEach(key => {
      if (DIM_LABELS[key] && radar[key] != null) {
        labels.push(`${DIM_LABELS[key]} ${radar[key]}`);
      }
    });
    return labels.slice(0, 4);
  },

  // ====== Canvas 2D 趋势折线图 ======
  drawChart(retries) {
    const n = retries == null ? 0 : retries;
    const query = this.createSelectorQuery();
    query.select('#trendChart').fields({ node: true, size: true }).exec((res) => {
      if (!res || !res[0] || !res[0].node) {
        if (n < 3) {
          setTimeout(() => this.drawChart(n + 1), 80);
        }
        return;
      }
      const canvas = res[0].node;
      const fields = res[0];
      const ctx = canvas.getContext('2d');
      const dpr = (wx.getWindowInfo && wx.getWindowInfo().pixelRatio) || 2;

      canvas.width = fields.width * dpr;
      canvas.height = fields.height * dpr;
      ctx.scale(dpr, dpr);

      this._paintChart(ctx, fields.width, fields.height);
    });
  },

  _paintChart(ctx, w, h) {
    const scores = this._scores;
    if (!scores || scores.length === 0) return;

    const padLeft = 40;
    const padRight = 16;
    const padTop = 16;
    const padBottom = 32;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;
    const maxY = 100;

    // 清空画布
    ctx.clearRect(0, 0, w, h);

    // 网格线 + Y轴标签
    const yTicks = [0, 25, 50, 75, 100];
    ctx.strokeStyle = '#eef2f1';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    yTicks.forEach(val => {
      const y = padTop + chartH - (val / maxY) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartW, y);
      ctx.stroke();
      ctx.fillText(String(val), padLeft - 6, y);
    });

    // 数据点坐标
    const points = [];
    if (scores.length === 1) {
      points.push({ x: padLeft + chartW / 2, y: padTop + chartH - (scores[0] / maxY) * chartH });
    } else {
      const stepX = chartW / (scores.length - 1);
      scores.forEach((s, i) => {
        points.push({
          x: padLeft + i * stepX,
          y: padTop + chartH - (s / maxY) * chartH,
        });
      });
    }

    // 折线
    if (points.length > 1) {
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // 填充区域
      ctx.fillStyle = 'rgba(15,118,110,0.08)';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.lineTo(points[points.length - 1].x, padTop + chartH);
      ctx.lineTo(points[0].x, padTop + chartH);
      ctx.closePath();
      ctx.fill();
    }

    // 数据点
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#0f766e';
      ctx.fill();
    });

    // X轴日期标签（首尾）
    const records = this._records;
    if (records && records.length > 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.textBaseline = 'top';

      const firstDate = this.shortDate(records[0].id);
      ctx.textAlign = 'left';
      ctx.fillText(firstDate, padLeft, padTop + chartH + 8);

      if (records.length > 1) {
        const lastDate = this.shortDate(records[records.length - 1].id);
        ctx.textAlign = 'right';
        ctx.fillText(lastDate, padLeft + chartW, padTop + chartH + 8);
      }
    }
  },

  shortDate(id) {
    // 从记录中找日期，直接用 list 中的 dateStr 截取
    const rec = (this._records || []).find(r => r.id === id);
    if (rec) {
      const parts = rec.dateStr.split(' ');
      return parts[0] || '';
    }
    return '';
  },

  // ====== 交互 ======
  onTapRecord(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/subpkg/history/analysis/detail/index?id=${id}` });
  },

  onGoAnalyze() { wx.switchTab({ url: '/pages/analyze/index' }); },
});

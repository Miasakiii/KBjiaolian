const LABELS = ['头前伸','圆肩','骨盆前倾','膝超伸','脊柱侧弯','高低肩','XO型腿','核心稳定'];
const KEYS = ['headForward','roundShoulder','pelvicTilt','kneeExtension','spinalCurvature','shoulderHeight','legAlignment','coreStability'];

Component({
  properties: {
    data: { type: Object, value: {} },        // { headForward: 88, ... }
    mode: { type: String, value: 'result' },  // result | compare
    prevData: { type: Object, value: {} },    // compare 模式上次数据
    size: { type: Number, value: 280 },        // canvas px
  },
  data: { canvasId: 'kbRadar' + Math.random().toString(36).slice(2, 8) },
  observers: {
    'data, prevData, mode': function () {
      this.draw();
    },
  },
  lifetimes: {
    attached() { this.draw(); },
  },
  methods: {
    vals(obj) {
      return KEYS.map(k => Number(obj && obj[k] || 0));
    },
    draw() {
      const query = this.createSelectorQuery();
      query.select('#' + this.data.canvasId).fields({ node: true, size: true }).exec((res) => {
        if (!res || !res[0] || !res[0].node) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = (wx.getWindowInfo && wx.getWindowInfo().pixelRatio) || 2;
        const size = this.data.size;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);
        this.render(ctx, size);
      });
    },
    render(ctx, size) {
      const cx = size / 2, cy = size / 2;
      const radius = size / 2 - 26;
      const N = 8;
      const angle = i => -Math.PI / 2 + 2 * Math.PI * i / N;
      const point = (r, i) => ({ x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) });

      ctx.clearRect(0, 0, size, size);

      // 网格 4 圈
      ctx.strokeStyle = '#eef2f1';
      ctx.lineWidth = 1;
      for (let ring = 1; ring <= 4; ring++) {
        const r = radius * ring / 4;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const p = point(r, i % N);
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      // 轴线
      for (let i = 0; i < N; i++) {
        const p = point(radius, i);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y); ctx.stroke();
      }

      // compare: 先画上次(灰虚线)
      if (this.data.mode === 'compare' && this.data.prevData) {
        this.drawPoly(ctx, this.vals(this.data.prevData), radius, cx, cy, N, point, {
          stroke: '#cbd5e1', fill: null, dashed: true,
        });
      }

      // 本次
      const cur = this.vals(this.data.data);
      this.drawPoly(ctx, cur, radius, cx, cy, N, point, {
        stroke: '#0f766e', fill: 'rgba(15,118,110,0.12)', dashed: false, dots: true,
      });

      // result 模式: 问题点高亮(最低分)
      if (this.data.mode === 'result') {
        let minIdx = 0, minVal = cur[0];
        for (let i = 1; i < N; i++) { if (cur[i] < minVal) { minVal = cur[i]; minIdx = i; } }
        const p = point(radius * (cur[minIdx] / 100), minIdx);
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, 2 * Math.PI); ctx.stroke();
      }

      // 标签
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let i = 0; i < N; i++) {
        const p = point(radius + 14, i);
        const a = angle(i);
        if (Math.cos(a) > 0.3) ctx.textAlign = 'left';
        else if (Math.cos(a) < -0.3) ctx.textAlign = 'right';
        else ctx.textAlign = 'center';
        ctx.fillText(LABELS[i], p.x, p.y);
      }

      // compare 图例
      if (this.data.mode === 'compare') {
        ctx.fillStyle = '#0f766e'; ctx.fillRect(cx - 30, cy + radius + 16, 12, 3);
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('本次', cx - 14, cy + radius + 18);
        ctx.strokeStyle = '#cbd5e1'; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(cx + 10, cy + radius + 18); ctx.lineTo(cx + 22, cy + radius + 18); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText('上次', cx + 26, cy + radius + 18);
      }
    },
    drawPoly(ctx, vals, radius, cx, cy, N, point, opt) {
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const p = point(radius * (Math.max(0, Math.min(100, vals[i])) / 100), i);
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      if (opt.fill) { ctx.fillStyle = opt.fill; ctx.fill(); }
      ctx.strokeStyle = opt.stroke;
      ctx.lineWidth = 2;
      if (opt.dashed) ctx.setLineDash([4, 3]); else ctx.setLineDash([]);
      ctx.stroke();
      ctx.setLineDash([]);
      if (opt.dots) {
        ctx.fillStyle = opt.stroke;
        for (let i = 0; i < N; i++) {
          const p = point(radius * (Math.max(0, Math.min(100, vals[i])) / 100), i);
          ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, 2 * Math.PI); ctx.fill();
        }
      }
    },
  },
});

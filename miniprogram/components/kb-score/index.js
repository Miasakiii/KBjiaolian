Component({
  properties: {
    value: { type: null, value: '--' },     // 数字或 '--'
    label: { type: String, value: '综合评分' },
    delta: { type: Number, value: 0 },       // 较上次变化，0 不显示
    variant: { type: String, value: 'plain' }, // plain | ring
    level: { type: String, value: '' },      // ring 模式下显示等级文字
  },
  data: {
    deltaStr: '',
    deltaUp: true,
  },
  observers: {
    'delta': function (d) {
      this._computeDelta(d);
    },
  },
  lifetimes: {
    attached() { this._computeDelta(this.data.delta); },
  },
  methods: {
    _computeDelta(d) {
      if (!d) { this.setData({ deltaStr: '' }); return; }
      this.setData({
        deltaStr: (d > 0 ? '↑ +' : '↓ ') + Math.abs(d) + ' 较上次',
        deltaUp: d > 0,
      });
    },
  },
});

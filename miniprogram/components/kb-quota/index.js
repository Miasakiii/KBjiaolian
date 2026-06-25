Component({
  properties: {
    items: {
      type: Array,
      value: [],
      // 每项 { label, remaining, total }
    },
  },
  data: {
    computed: [],
  },
  observers: {
    'items': function (items) {
      const computed = (items || []).map(it => {
        const total = it.total || 0;
        const remaining = it.remaining || 0;
        const percent = total > 0 ? Math.min(100, (remaining / total) * 100) : 0;
        const over = remaining > total; // 超量
        return { ...it, percent, over };
      });
      this.setData({ computed });
    },
  },
  lifetimes: {
    attached() {
      this.observers.items.call(this, this.data.items);
    },
  },
});

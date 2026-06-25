Component({
  properties: {
    icon: { type: String, value: '/assets/icons/st-info.svg' },
    text: { type: String, value: '暂无数据' },
    cta: { type: String, value: '' },
  },
  methods: {
    onTapCta() { this.triggerEvent('cta'); },
  },
});

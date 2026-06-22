// subpkg/user/payment/index.js
const { request } = require('../../../utils/request');

Page({
  data: { plan: 'pro', period: 'month', planName: 'Pro 月付', price: 29, paying: false },

  onLoad(options) {
    const plan = options.plan || 'pro';
    const period = options.period || 'month';
    const planName = period === 'year' ? 'Pro 年付' : 'Pro 月付';
    const price = period === 'year' ? 199 : 29;
    this.setData({ plan, period, planName, price });
  },

  async onPay() {
    if (this.data.paying) return;
    this.setData({ paying: true });
    try {
      // Step1: 后端创建订单
      const order = await request({
        url: '/orders',
        method: 'POST',
        data: { plan: this.data.plan, period: this.data.period },
      });
      // Step2: 唤起微信支付（后端需返回 prepay 参数）
      // 注意：需后端配合实现 /api/orders/:id/pay 返回 wx.requestPayment 所需参数
      wx.showToast({ title: '支付功能开发中', icon: 'none' });
      this.setData({ paying: false });
    } catch (err) {
      this.setData({ paying: false });
    }
  },
});

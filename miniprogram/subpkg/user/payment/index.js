// subpkg/user/payment/index.js
// 微信小程序支付页面 — 对接后端微信支付 JSAPI
const { request } = require('../../../utils/request');

Page({
  data: {
    plan: 'pro_monthly',
    planName: 'Pro 月付',
    price: '29.90',
    paying: false,
    loading: true,
    orderId: null,
  },

  onLoad(options) {
    const plan = options.plan || 'pro_monthly';
    const planMap = {
      pro_monthly: { name: 'Pro 月付', price: '29.90' },
      pro_yearly: { name: 'Pro 年付', price: '168.00' },
    };
    const info = planMap[plan] || planMap.pro_monthly;
    this.setData({ plan, planName: info.name, price: info.price });
  },

  // 点击支付按钮
  async onPay() {
    if (this.data.paying) return;
    this.setData({ paying: true });

    try {
      // Step 1: 创建订单
      const orderRes = await request({
        url: '/orders',
        method: 'POST',
        data: { plan: this.data.plan },
      });

      const order = orderRes.order;
      this.setData({ orderId: order.id });

      // Step 2: 获取支付参数
      const app = getApp();
      const openid = app.globalData.user?.openid || '';

      const payRes = await request({
        url: `/orders/${order.id}/pay`,
        method: 'POST',
        data: {
          platform: 'miniapp',
          openid,
        },
      });

      const payment = payRes.payment;

      // mock 支付分支：仅开发版/体验版可用，正式版强制走真实微信支付
      // 防止后端误配 NODE_ENV 导致生产环境白嫖 Pro 套餐
      const envVersion = wx.getAccountInfoSync().miniProgram.envVersion;
      const isDevEnv = envVersion === 'develop' || envVersion === 'trial';

      if (isDevEnv && payment.mockPayUrl) {
        await request({ url: payment.mockPayUrl.replace('/api', ''), method: 'POST' });
        this._onPaySuccess(order.id);
        return;
      }

      // 正式版或无 mockPayUrl：走真实微信支付
      if (!payment.timeStamp || !payment.paySign) {
        throw new Error('支付参数不完整，请联系客服');
      }

      // Step 3: 调用微信支付
      await wx.requestPayment({
        timeStamp: payment.timeStamp,
        nonceStr: payment.nonceStr,
        package: payment.package,
        signType: payment.signType,
        paySign: payment.paySign,
      });

      // Step 4: 支付成功
      this._onPaySuccess(order.id);
    } catch (err) {
      console.error('支付失败:', err);
      if (err.errMsg === 'requestPayment:fail cancel') {
        wx.showToast({ title: '已取消支付', icon: 'none' });
      } else {
        wx.showToast({ title: err.message || '支付失败，请重试', icon: 'none' });
      }
    } finally {
      this.setData({ paying: false });
    }
  },

  // 支付成功处理
  _onPaySuccess(orderId) {
    wx.showToast({ title: '支付成功！', icon: 'success' });

    // 更新本地用户信息中的套餐
    const app = getApp();
    if (app.globalData.user) {
      app.globalData.user.plan = this.data.plan.replace('_monthly', '').replace('_yearly', '');
      wx.setStorageSync('user', app.globalData.user);
    }

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      wx.navigateBack({ delta: 2 });
    }, 1500);
  },

  // 跳转用户协议
  onViewAgreement() {
    wx.navigateTo({ url: '/subpkg/user/agreement/index' });
  },

  // 跳转隐私政策
  onViewPrivacy() {
    wx.navigateTo({ url: '/subpkg/user/privacy/index' });
  },
});

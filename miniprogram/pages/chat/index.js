// pages/chat/index.js - AI 对话页逻辑
const { request } = require('../../utils/request');
const { mdToHtml } = require('../../utils/markdown');
const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    messages: [],
    inputValue: '',
    loading: false,
    scrollToId: '',
    quickPrompts: [
      { key: 'posture', label: '如何改善头前伸？', prompt: '头前伸怎么改善？' },
      { key: 'squat', label: '深蹲姿势正确吗？', prompt: '深蹲的正确姿势是什么？' },
      { key: 'diet', label: '健身怎么吃？', prompt: '健身减脂应该怎么安排饮食？' },
      { key: 'recovery', label: '练后如何恢复？', prompt: '训练后怎么加速肌肉恢复？' },
    ],
    msgIdCounter: 0,
  },

  onLoad() { this.checkLogin(); },
  onShow() { if (app.globalData.isLoggedIn) this.setData({ isLoggedIn: true }); },

  checkLogin() {
    if (!app.globalData.isLoggedIn) this.setData({ isLoggedIn: false });
    else this.setData({ isLoggedIn: true });
  },

  // 输入
  onInput(e) { this.setData({ inputValue: e.detail.value }); },

  // 快捷提问
  onTapQuick(e) {
    const prompt = e.currentTarget.dataset.prompt;
    this.setData({ inputValue: prompt });
    this.sendMessage(prompt);
  },

  // 发送
  onSend() {
    const text = this.data.inputValue.trim();
    if (!text || this.data.loading) return;
    this.sendMessage(text);
  },

  async sendMessage(content) {
    const id = ++this.data.msgIdCounter;
    const userMsg = { id: `u-${id}`, role: 'user', content, time: this.formatTime() };
    const loadingId = `l-${id}`;
    this.setData({
      messages: [...this.data.messages, userMsg],
      inputValue: '',
      loading: true,
      scrollToId: `msg-${userMsg.id}`,
    });

    try {
      // 小程序不支持 SSE，用非流式接口
      const res = await request({
        url: '/chat',
        method: 'POST',
        data: {
          message: content,
          history: this.data.messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        },
      });

      const aiContent = res?.reply || '暂无回复';
      const aiId = `a-${id}`;
      const aiMsg = {
        id: aiId,
        role: 'ai',
        content: aiContent,
        contentHtml: mdToHtml(aiContent),
        time: this.formatTime(),
      };
      this.setData({
        messages: [...this.data.messages, aiMsg],
        loading: false,
        scrollToId: `msg-${aiId}`,
      });
    } catch (err) {
      const errMsg = '抱歉，出错了，请重试。';
      this.setData({
        messages: [...this.data.messages, { id: `e-${id}`, role: 'ai', content: errMsg, contentHtml: mdToHtml(errMsg), time: this.formatTime() }],
        loading: false,
      });
    }
  },

  formatTime() {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  },

  onTapLogin() {
    wx.navigateTo({ url: '/subpkg/user/login/index' });
  },
});
